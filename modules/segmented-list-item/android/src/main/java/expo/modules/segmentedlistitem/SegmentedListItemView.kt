package expo.modules.segmentedlistitem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.SegmentedListItem
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
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

data class SegmentedListItemEvent(@Field val index: Int = 0) : Record

data class SegmentedListItemProps(
  val index: Int = 0,
  val count: Int = 1,
  /** Null: an action row. Otherwise one choice of a single-select list, with its radio. */
  val selected: Boolean? = null,
  val enabled: Boolean = true,
  /** Whether a long press does something, so the row offers it to TalkBack. */
  val longPressable: Boolean = false,
  /** Its fill when not selected; M3's segmented color (surface) when left out. */
  val containerColor: android.graphics.Color? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/** M3 Expressive segmented list item; slot children fill its places, the rest is its headline. */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun FunctionalComposableScope.SegmentedListItemContent(
  props: SegmentedListItemProps,
  onItemPress: (SegmentedListItemEvent) -> Unit,
  onItemLongPress: (SegmentedListItemEvent) -> Unit
) {
  val slot = { name: String ->
    val present = (0 until view.size).any { isSlotWithName(view.getChildAt(it) as ExpoComposeView<*>, name) }
    if (present) (@Composable { Children(UIComposableScope(), filter = { isSlotWithName(it, name) }) }) else null
  }
  val modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
  val shapes = ListItemDefaults.segmentedShapes(props.index, props.count)
  val press = { onItemPress(SegmentedListItemEvent(props.index)) }
  val longPress = if (props.longPressable) ({ onItemLongPress(SegmentedListItemEvent(props.index)) }) else null
  val headline: @Composable () -> Unit = { Children(UIComposableScope(), filter = { !isSlotView(it) }) }
  val trailing = slot("trailing")
  val selected = props.selected
  val colors = props.containerColor.composeOrNull
    ?.let { ListItemDefaults.segmentedColors(containerColor = it) }
    ?: ListItemDefaults.segmentedColors()

  if (selected == null) {
    SegmentedListItem(
      onClick = press,
      shapes = shapes,
      modifier = modifier,
      enabled = props.enabled,
      leadingContent = slot("leading"),
      trailingContent = trailing,
      overlineContent = slot("overline"),
      supportingContent = slot("supporting"),
      onLongClick = longPress,
      colors = colors,
      content = headline
    )
  } else {
    SegmentedListItem(
      selected = selected,
      onClick = press,
      shapes = shapes,
      modifier = modifier,
      enabled = props.enabled,
      leadingContent = slot("leading"),
      trailingContent = {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
          trailing?.invoke()
          // The row carries the radio role and state; this one only shows it.
          RadioButton(selected = selected, onClick = null, enabled = props.enabled)
        }
      },
      overlineContent = slot("overline"),
      supportingContent = slot("supporting"),
      onLongClick = longPress,
      colors = colors,
      content = headline
    )
  }
}
