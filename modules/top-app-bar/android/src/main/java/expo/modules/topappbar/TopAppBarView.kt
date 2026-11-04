package expo.modules.topappbar

import android.view.View
import android.view.ViewGroup
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.text.input.clearText
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AppBarWithSearch
import androidx.compose.material3.Badge
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberSearchBarState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.layout
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.view.size
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.UIComposableScope
import expo.modules.ui.composeOrNull
import expo.modules.ui.isSlotView
import expo.modules.ui.isSlotWithName
import expo.modules.ui.resolveFontFamily
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

data class SearchTextEvent(@Field val text: String = "") : Record

data class PageChangeEvent(@Field val index: Int = 0) : Record

data class TopAppBarSearch(
  @Field val placeholder: String = "Search",
  @Field val text: String = ""
) : Record

data class TopAppBarTab(
  @Field val title: String = "",
  @Field val count: Int? = null
) : Record

data class TopAppBarProps(
  val title: String? = null,
  val search: TopAppBarSearch? = null,
  val containerColor: android.graphics.Color? = null,
  /** "pinned" or "enterAlways", after M3's TopAppBarDefaults scroll behaviors. */
  val scrollBehavior: String = "pinned",
  val tabs: List<TopAppBarTab> = emptyList(),
  val page: Int = 0,
  val tabsEdgePadding: Double = 52.0,
  val topInset: Double = 0.0,
  val fontFamily: String? = null,
  val tabFontFamily: String? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/**
 * M3 app bar: a small one with a title, or a search app bar. Tabs and content
 * are optional; with both, each content child is a page. The bar sits in the
 * content's own tree, so with `enterAlways` the bar and tabs leave together
 * as the content scrolls down and come back on the way up.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FunctionalComposableScope.TopAppBarContent(
  props: TopAppBarProps,
  onSearchTextChange: (SearchTextEvent) -> Unit,
  onPageChange: (PageChangeEvent) -> Unit
) {
  val font = appContext.reactContext?.let { resolveFontFamily(props.fontFamily, it) }
  val tabFont = appContext.reactContext?.let { resolveFontFamily(props.tabFontFamily, it) }

  // Children that aren't slots are the content, by index. view.size is no
  // snapshot state; mirror it, or the pager crashes on a page it never knew.
  fun contentIndexes() = (0 until view.size).filter {
    !isSlotView(view.getChildAt(it) as ExpoComposeView<*>)
  }
  val content = remember { mutableStateOf(contentIndexes()) }
  DisposableEffect(view) {
    view.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
      override fun onChildViewAdded(parent: View?, child: View?) {
        content.value = contentIndexes()
      }
      override fun onChildViewRemoved(parent: View?, child: View?) {
        content.value = contentIndexes()
      }
    })
    content.value = contentIndexes()
    onDispose { view.setOnHierarchyChangeListener(null) }
  }
  val pages = content.value

  val enterAlways = props.scrollBehavior == "enterAlways"
  val behavior = TopAppBarDefaults.enterAlwaysScrollBehavior()
  val scrolled = enterAlways && behavior.state.overlappedFraction > 0.01f
  val base = props.containerColor.composeOrNull ?: MaterialTheme.colorScheme.surface
  val color by animateColorAsState(if (scrolled) MaterialTheme.colorScheme.surfaceContainer else base)

  val hasTabs = props.tabs.isNotEmpty()
  val pagerState = rememberPagerState(initialPage = props.page.coerceAtLeast(0)) { pages.size }
  val scope = rememberCoroutineScope()

  // JS moved the page (a deep link, the back stack): follow it.
  LaunchedEffect(props.page, pages.size) {
    if (hasTabs && props.page in pages.indices && pagerState.settledPage != props.page) {
      pagerState.animateScrollToPage(props.page)
    }
  }
  LaunchedEffect(pagerState) {
    snapshotFlow { pagerState.settledPage }
      .drop(1)
      .collect {
        // The new page may sit anywhere: show the bar again, unscrolled.
        behavior.state.heightOffset = 0f
        behavior.state.contentOffset = 0f
        onPageChange(PageChangeEvent(it))
      }
  }

  val modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
  Box(if (enterAlways) modifier.nestedScroll(behavior.nestedScrollConnection) else modifier) {
    Column(Modifier.padding(top = props.topInset.dp).let { if (pages.isEmpty()) it else it.fillMaxSize() }) {
      Box(
        Modifier
          .clipToBounds()
          .layout { measurable, constraints ->
            val placeable = measurable.measure(constraints)
            if (!enterAlways) return@layout layout(placeable.width, placeable.height) { placeable.place(0, 0) }
            val limit = -placeable.height.toFloat()
            if (behavior.state.heightOffsetLimit != limit) behavior.state.heightOffsetLimit = limit
            val offset = behavior.state.heightOffset.roundToInt()
            layout(placeable.width, (placeable.height + offset).coerceAtLeast(0)) { placeable.place(0, offset) }
          }
          .background(color)
      ) {
        Column {
          Bar(props, font, onSearchTextChange)
          if (hasTabs) {
            PrimaryScrollableTabRow(
              selectedTabIndex = pagerState.currentPage.coerceIn(0, props.tabs.lastIndex),
              edgePadding = props.tabsEdgePadding.dp,
              containerColor = Color.Transparent
            ) {
              props.tabs.forEachIndexed { index, tab ->
                Tab(
                  selected = pagerState.currentPage == index,
                  onClick = { scope.launch { pagerState.animateScrollToPage(index) } },
                  text = {
                    Row(
                      horizontalArrangement = Arrangement.spacedBy(8.dp),
                      verticalAlignment = Alignment.CenterVertically
                    ) {
                      Text(tab.title, fontFamily = tabFont)
                      tab.count?.let {
                        // A tally, not an alert: secondary tones instead of Badge's default error red.
                        Badge(
                          containerColor = MaterialTheme.colorScheme.secondaryContainer,
                          contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        ) { Text(it.toString(), fontFamily = tabFont) }
                      }
                    }
                  }
                )
              }
            }
          }
        }
      }
      if (pages.isNotEmpty()) {
        Box(Modifier.weight(1f).clipToBounds()) {
          if (hasTabs) {
            HorizontalPager(state = pagerState) { index -> Child(UIComposableScope(), pages[index]) }
          } else {
            pages.forEach { Child(UIComposableScope(), it) }
          }
        }
      }
    }
    // Drawn last, over anything that scrolls up there: the status bar stays
    // put in the bar's color. The inset comes from JS; this Host gets none.
    Spacer(Modifier.fillMaxWidth().height(props.topInset.dp).background(color))
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FunctionalComposableScope.Bar(
  props: TopAppBarProps,
  font: androidx.compose.ui.text.font.FontFamily?,
  onSearchTextChange: (SearchTextEvent) -> Unit
) {
  val hasSlot = { name: String ->
    (0 until view.size).any { isSlotWithName(view.getChildAt(it) as ExpoComposeView<*>, name) }
  }
  val navigationIcon: @Composable () -> Unit = {
    Children(UIComposableScope(), filter = { isSlotWithName(it, "navigationIcon") })
  }
  val actions: @Composable androidx.compose.foundation.layout.RowScope.() -> Unit = {
    Children(UIComposableScope(rowScope = this), filter = { isSlotWithName(it, "actions") })
  }
  val search = props.search

  if (search == null) {
    TopAppBar(
      // A title slot (a screen's own title, in Compose) wins over `title`.
      title = {
        if (hasSlot("title")) {
          Children(UIComposableScope(), filter = { isSlotWithName(it, "title") })
        } else {
          props.title?.let { Text(it, fontFamily = font, maxLines = 1, overflow = TextOverflow.Ellipsis) }
        }
      },
      navigationIcon = navigationIcon,
      actions = actions,
      windowInsets = WindowInsets(0),
      colors = TopAppBarDefaults.topAppBarColors(
        containerColor = Color.Transparent,
        scrolledContainerColor = Color.Transparent
      )
    )
    return
  }

  val field = rememberTextFieldState(search.text)
  // No expanded search view: the field filters what's on screen in place.
  val searchState = rememberSearchBarState()
  val focus = LocalFocusManager.current
  LaunchedEffect(field) {
    snapshotFlow { field.text.toString() }
      .drop(1)
      .collect { onSearchTextChange(SearchTextEvent(it)) }
  }
  AppBarWithSearch(
    state = searchState,
    inputField = {
      SearchBarDefaults.InputField(
        textFieldState = field,
        searchBarState = searchState,
        onSearch = { focus.clearFocus() },
        placeholder = { Text(search.placeholder, fontFamily = font, maxLines = 1) },
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
        trailingIcon = if (field.text.isEmpty()) null else {
          {
            IconButton(onClick = { field.clearText() }) {
              Icon(Icons.Default.Close, contentDescription = "Clear search")
            }
          }
        }
      )
    },
    navigationIcon = if (hasSlot("navigationIcon")) navigationIcon else null,
    actions = if (hasSlot("actions")) actions else null,
    windowInsets = WindowInsets(0),
    colors = SearchBarDefaults.appBarWithSearchColors(
      appBarContainerColor = Color.Transparent,
      scrolledAppBarContainerColor = Color.Transparent
    )
  )
}
