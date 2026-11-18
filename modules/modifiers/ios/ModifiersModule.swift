import ExpoModulesCore
import ExpoUI
import SwiftUI

/// SwiftUI modifiers @expo/ui lacks, for any of its components.
public class ModifiersModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Modifiers")

    OnCreate {
      ViewModifierRegistry.register("buttonRepeatBehavior") { _, _, _ in ButtonRepeatBehaviorModifier() }
    }

    OnDestroy {
      ViewModifierRegistry.unregister("buttonRepeatBehavior")
    }
  }
}

/// SwiftUI's own repeat: a held Button runs its action again and again. Before
/// iOS 17 a hold is one tap.
struct ButtonRepeatBehaviorModifier: ViewModifier {
  func body(content: Content) -> some View {
    if #available(iOS 17.0, *) {
      content.buttonRepeatBehavior(.enabled)
    } else {
      content
    }
  }
}
