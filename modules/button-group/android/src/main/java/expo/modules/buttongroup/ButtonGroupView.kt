package expo.modules.buttongroup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.ButtonGroupDefaults
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Text
import androidx.compose.material3.ToggleButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.resolveFontFamily

data class ButtonGroupChangeEvent(
  @Field val index: Int = 0,
  @Field val checked: Boolean = false
) : Record

data class ButtonGroupProps(
  val options: List<String> = emptyList(),
  val selected: List<Int> = emptyList(),
  val multiple: Boolean = false,
  val fontFamily: String? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

/**
 * M3 Expressive connected button group: toggle buttons that share the row,
 * with round outer corners and a shape morph on press and selection.
 * Selection stays in JS; each press only reports which button and its new state.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun FunctionalComposableScope.ButtonGroupContent(
  props: ButtonGroupProps,
  onChange: (ButtonGroupChangeEvent) -> Unit
) {
  val font = appContext.reactContext?.let { resolveFontFamily(props.fontFamily, it) }
  val last = props.options.lastIndex
  val role = if (props.multiple) Role.Checkbox else Role.RadioButton

  Row(
    ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher),
    horizontalArrangement = Arrangement.spacedBy(ButtonGroupDefaults.ConnectedSpaceBetween)
  ) {
    props.options.forEachIndexed { index, label ->
      ToggleButton(
        checked = index in props.selected,
        onCheckedChange = { onChange(ButtonGroupChangeEvent(index, it)) },
        modifier = Modifier.weight(1f).semantics { this.role = role },
        shapes = when (index) {
          0 -> ButtonGroupDefaults.connectedLeadingButtonShapes()
          last -> ButtonGroupDefaults.connectedTrailingButtonShapes()
          else -> ButtonGroupDefaults.connectedMiddleButtonShapes()
        }
      ) {
        Text(label, fontFamily = font, maxLines = 1, overflow = TextOverflow.Ellipsis)
      }
    }
  }
}
