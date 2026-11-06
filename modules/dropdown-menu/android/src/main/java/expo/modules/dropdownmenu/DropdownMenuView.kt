package expo.modules.dropdownmenu

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.CheckableDropdownMenuItem
import androidx.compose.material3.DropdownMenuGroup
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.DropdownMenuPopup
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.SelectableDropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.withFrameNanos
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.layout
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.offset
import androidx.core.view.size
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.UIComposableScope
import expo.modules.ui.isSlotView
import expo.modules.ui.isSlotWithName
import expo.modules.ui.resolveFontFamily

// The popup window's own shadow inset (its maxSupportedElevation).
private val SHADOW_ROOM = 8.dp

data class DropdownMenuEvent(@Field val index: Int = 0) : Record

data class DropdownMenuProps(
  val expanded: Boolean = false,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

data class DropdownMenuGroupProps(
  val index: Int = 0,
  val count: Int = 1,
  val heading: String? = null,
  val fontFamily: String? = null
) : ComposeProps

data class DropdownMenuItemProps(
  val label: String = "",
  val index: Int = 0,
  val count: Int = 1,
  /** Null: a plain action. Otherwise the row is selectable and shows its state. */
  val checked: Boolean? = null,
  /** "radio" or "checkbox", for selectable rows. */
  val selection: String = "radio",
  val enabled: Boolean = true,
  val destructive: Boolean = false,
  val fontFamily: String? = null
) : ComposeProps

/**
 * M3 Expressive menu: the trigger slot stays in place and the popup holds the
 * groups, each a rounded segment with its own rows.
 */
@Composable
fun FunctionalComposableScope.DropdownMenuContent(props: DropdownMenuProps, onDismissRequest: (DropdownMenuEvent) -> Unit) {
  Box(ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)) {
    Children(UIComposableScope(), filter = { isSlotWithName(it, "trigger") })
    DropdownMenuPopup(expanded = props.expanded, onDismissRequest = { onDismissRequest(DropdownMenuEvent()) }) {
      // Unlike DropdownMenu, the Expressive popup's column doesn't scroll itself.
      // The scroll clips along its axis, which cut the groups' shadows: its
      // viewport reaches SHADOW_ROOM past its slot and pads the content back.
      Column(
        Modifier
          .layout { measurable, constraints ->
            val room = SHADOW_ROOM.roundToPx()
            val placeable = measurable.measure(constraints.offset(vertical = 2 * room))
            layout(placeable.width, placeable.height - 2 * room) { placeable.place(0, -room) }
          }
          .verticalScroll(rememberScrollState())
          .padding(vertical = SHADOW_ROOM),
        verticalArrangement = Arrangement.spacedBy(MenuDefaults.GroupSpacing)
      ) {
        Children(UIComposableScope(), filter = { !isSlotView(it) })
      }
    }
  }
}

@Composable
fun FunctionalComposableScope.DropdownMenuGroupContent(props: DropdownMenuGroupProps) {
  val font = appContext.reactContext?.let { resolveFontFamily(props.fontFamily, it) }
  DropdownMenuGroup(shapes = MenuDefaults.groupShape(props.index, props.count)) {
    props.heading?.let { heading ->
      MenuDefaults.DropdownMenuGroupLabel { Text(heading, fontFamily = font) }
    }
    Children(UIComposableScope())
  }
}

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun FunctionalComposableScope.DropdownMenuItemContent(props: DropdownMenuItemProps, onItemPress: (DropdownMenuEvent) -> Unit) {
  val font = appContext.reactContext?.let { resolveFontFamily(props.fontFamily, it) }
  val shapes = MenuDefaults.itemShape(props.index, props.count)
  val color = if (props.destructive) MaterialTheme.colorScheme.error else Color.Unspecified
  val text: @Composable () -> Unit = { Text(props.label, fontFamily = font, color = color) }
  // The row's children are its leading icon.
  val icon: (@Composable () -> Unit)? = if (view.size > 0) {
    { Children(UIComposableScope()) }
  } else {
    null
  }
  val check: @Composable () -> Unit = { Icon(Icons.Default.Check, contentDescription = null) }
  val press = { onItemPress(DropdownMenuEvent(props.index)) }
  val checked = props.checked

  when {
    // Not the shaped overload: it's a selectable Surface, which TalkBack reads
    // as "not checked". The classic clickable row, inset and clipped like it.
    checked == null -> DropdownMenuItem(
      text = text,
      onClick = press,
      modifier = Modifier.padding(horizontal = 4.dp).clip(shapes.shape),
      leadingIcon = icon,
      enabled = props.enabled
    )
    props.selection == "checkbox" -> CheckableDropdownMenuItem(
      checked = checked,
      onCheckedChange = { press() },
      text = text,
      shapes = shapes,
      leadingIcon = icon,
      checkedLeadingIcon = check,
      enabled = props.enabled
    )
    else -> SelectableDropdownMenuItem(
      selected = checked,
      onClick = press,
      text = text,
      modifier = Modifier.bringIntoViewRequester(selectedInView(checked)),
      shapes = shapes,
      leadingIcon = icon,
      selectedLeadingIcon = check,
      enabled = props.enabled
    )
  }
}

/** Scrolls a long menu to its selected choice as it opens; picks made while open stay put. */
@Composable
private fun selectedInView(selected: Boolean): BringIntoViewRequester {
  val requester = remember { BringIntoViewRequester() }
  LaunchedEffect(Unit) {
    if (!selected) return@LaunchedEffect
    // Laid out first: there's nothing to bring before the popup's first frame.
    withFrameNanos {}
    requester.bringIntoView()
  }
  return requester
}
