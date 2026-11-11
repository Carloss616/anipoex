package expo.modules.segmentedlistitem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.shape.CornerBasedShape
import androidx.compose.foundation.shape.CornerSize
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.SegmentedListItem
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.dp
import androidx.core.view.size
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.PaddingValuesRecord
import expo.modules.ui.UIComposableScope
import expo.modules.ui.composeOrNull
import expo.modules.ui.isSlotView
import expo.modules.ui.isSlotWithName

data class SegmentedListItemEvent(@Field val index: Int = 0) : Record

/** `ListItemDefaults.segmentedColors`; one left out keeps M3's. */
data class SegmentedListItemColors(
  @Field val containerColor: android.graphics.Color? = null,
  @Field val contentColor: android.graphics.Color? = null,
  @Field val leadingContentColor: android.graphics.Color? = null,
  @Field val trailingContentColor: android.graphics.Color? = null,
  @Field val overlineContentColor: android.graphics.Color? = null,
  @Field val supportingContentColor: android.graphics.Color? = null,
  @Field val selectedContainerColor: android.graphics.Color? = null,
  @Field val selectedContentColor: android.graphics.Color? = null
) : Record

/** Corner radii in dp over the segmented shape's; one left out keeps its own. */
data class SegmentedListItemShape(
  @Field val topStart: Float? = null,
  @Field val topEnd: Float? = null,
  @Field val bottomEnd: Float? = null,
  @Field val bottomStart: Float? = null
) : Record

data class SegmentedListItemProps(
  val index: Int = 0,
  val count: Int = 1,
  /** Null: an action row. Otherwise one choice of a single-select list, with its radio. */
  val selected: Boolean? = null,
  val enabled: Boolean = true,
  /** Whether a tap does something; neither this nor longPressable: no ripple, no click role. */
  val pressable: Boolean = false,
  /** Whether a long press does something, so the row offers it to TalkBack. */
  val longPressable: Boolean = false,
  /** TalkBack's name for the long-press action. */
  val onLongPressLabel: String? = null,
  /** "top", "center" or "bottom"; left out, M3 centers short rows and tops tall ones. */
  val verticalAlignment: String? = null,
  val colors: SegmentedListItemColors? = null,
  /** In dp; a side left out keeps M3's. */
  val contentPadding: PaddingValuesRecord? = null,
  val shape: SegmentedListItemShape? = null,
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
  val segmented = ListItemDefaults.segmentedShapes(props.index, props.count)
  val shapes = remember(segmented, props.shape) {
    val corners = props.shape
    val base = segmented.shape as? CornerBasedShape
    if (corners == null || base == null) segmented
    else segmented.copy(
      shape = base.copy(
        topStart = corners.topStart?.let { CornerSize(it.dp) } ?: base.topStart,
        topEnd = corners.topEnd?.let { CornerSize(it.dp) } ?: base.topEnd,
        bottomEnd = corners.bottomEnd?.let { CornerSize(it.dp) } ?: base.bottomEnd,
        bottomStart = corners.bottomStart?.let { CornerSize(it.dp) } ?: base.bottomStart
      )
    )
  }
  val press = { onItemPress(SegmentedListItemEvent(props.index)) }
  val longPress = if (props.longPressable) ({ onItemLongPress(SegmentedListItemEvent(props.index)) }) else null
  val headline: @Composable () -> Unit = { Children(UIComposableScope(), filter = { !isSlotView(it) }) }
  val trailing = slot("trailing")
  val selected = props.selected
  val colors = props.colors.let { c ->
    ListItemDefaults.segmentedColors(
      containerColor = c?.containerColor.composeOrNull ?: Color.Unspecified,
      contentColor = c?.contentColor.composeOrNull ?: Color.Unspecified,
      leadingContentColor = c?.leadingContentColor.composeOrNull ?: Color.Unspecified,
      trailingContentColor = c?.trailingContentColor.composeOrNull ?: Color.Unspecified,
      overlineContentColor = c?.overlineContentColor.composeOrNull ?: Color.Unspecified,
      supportingContentColor = c?.supportingContentColor.composeOrNull ?: Color.Unspecified,
      selectedContainerColor = c?.selectedContainerColor.composeOrNull ?: Color.Unspecified,
      selectedContentColor = c?.selectedContentColor.composeOrNull ?: Color.Unspecified
    )
  }
  val verticalAlignment = when (props.verticalAlignment) {
    "top" -> Alignment.Top
    "center" -> Alignment.CenterVertically
    "bottom" -> Alignment.Bottom
    else -> ListItemDefaults.verticalAlignment()
  }
  val direction = LocalLayoutDirection.current
  val base = ListItemDefaults.ContentPadding
  val contentPadding = props.contentPadding?.let {
    PaddingValues(
      start = it.start?.dp ?: base.calculateStartPadding(direction),
      top = it.top?.dp ?: base.calculateTopPadding(),
      end = it.end?.dp ?: base.calculateEndPadding(direction),
      bottom = it.bottom?.dp ?: base.calculateBottomPadding()
    )
  } ?: base

  if (selected == null && !props.pressable && longPress == null) {
    SegmentedListItem(
      shapes = shapes,
      modifier = modifier,
      enabled = props.enabled,
      leadingContent = slot("leading"),
      trailingContent = trailing,
      overlineContent = slot("overline"),
      supportingContent = slot("supporting"),
      verticalAlignment = verticalAlignment,
      colors = colors,
      contentPadding = contentPadding,
      content = headline
    )
  } else if (selected == null) {
    SegmentedListItem(
      onClick = press,
      shapes = shapes,
      modifier = modifier,
      enabled = props.enabled,
      leadingContent = slot("leading"),
      trailingContent = trailing,
      overlineContent = slot("overline"),
      supportingContent = slot("supporting"),
      verticalAlignment = verticalAlignment,
      onLongClick = longPress,
      onLongClickLabel = props.onLongPressLabel,
      colors = colors,
      contentPadding = contentPadding,
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
      verticalAlignment = verticalAlignment,
      onLongClick = longPress,
      onLongClickLabel = props.onLongPressLabel,
      colors = colors,
      contentPadding = contentPadding,
      content = headline
    )
  }
}
