package expo.modules.tabbedpager

import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.size
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.UIComposableScope
import expo.modules.ui.resolveFontFamily
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch

data class TabItem(
  @Field val title: String = "",
  @Field val count: Int? = null
) : Record

data class PageChangeEvent(@Field val index: Int = 0) : Record

data class TabbedPagerProps(
  val tabs: List<TabItem> = emptyList(),
  val page: Int = 0,
  val fontFamily: String? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/**
 * M3 tabs over a pager on one PagerState, so the indicator follows the finger.
 * Each child view is one page.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FunctionalComposableScope.TabbedPagerContent(
  props: TabbedPagerProps,
  onPageChange: (PageChangeEvent) -> Unit
) {
  // view.size is no snapshot state; mirror it, as @expo/ui's HorizontalPagerView
  // does, or the pager crashes on an index it never knew about.
  val pageCount = remember { mutableIntStateOf(view.size) }
  DisposableEffect(view) {
    view.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
      override fun onChildViewAdded(parent: View?, child: View?) {
        pageCount.intValue = view.size
      }
      override fun onChildViewRemoved(parent: View?, child: View?) {
        pageCount.intValue = view.size
      }
    })
    pageCount.intValue = view.size
    onDispose { view.setOnHierarchyChangeListener(null) }
  }

  val pagerState = rememberPagerState(initialPage = props.page.coerceAtLeast(0)) {
    pageCount.intValue
  }
  val scope = rememberCoroutineScope()
  val font = appContext.reactContext?.let { resolveFontFamily(props.fontFamily, it) }

  // JS moved the page (a deep link, the back stack): follow it.
  LaunchedEffect(props.page, pageCount.intValue) {
    val count = pageCount.intValue
    if (props.page in 0 until count && pagerState.settledPage != props.page) {
      pagerState.animateScrollToPage(props.page)
    }
  }
  LaunchedEffect(pagerState) {
    snapshotFlow { pagerState.settledPage }
      .drop(1)
      .collect { onPageChange(PageChangeEvent(it)) }
  }

  if (pageCount.intValue == 0) return

  Column(
    ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
  ) {
    PrimaryScrollableTabRow(
      selectedTabIndex = pagerState.currentPage.coerceIn(0, (props.tabs.size - 1).coerceAtLeast(0)),
      edgePadding = 16.dp
    ) {
      props.tabs.forEachIndexed { index, tab ->
        Tab(
          selected = pagerState.currentPage == index,
          onClick = { scope.launch { pagerState.animateScrollToPage(index) } },
          text = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Text(tab.title, fontFamily = font)
              tab.count?.let {
                Text(
                  it.toString(),
                  fontFamily = font,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        )
      }
    }
    HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { index ->
      Child(UIComposableScope(), index)
    }
  }
}
