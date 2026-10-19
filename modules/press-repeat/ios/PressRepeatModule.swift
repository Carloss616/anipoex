import ExpoModulesCore
import ExpoUI
import SwiftUI

private let TYPE = "onPressRepeat"

public class PressRepeatModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PressRepeat")

    OnCreate {
      ViewModifierRegistry.register(TYPE) { _, _, eventDispatcher in
        PressRepeatModifier(eventDispatcher: eventDispatcher)
      }
    }

    OnDestroy {
      ViewModifierRegistry.unregister(TYPE)
    }
  }
}

/// Sends `start` when a press begins, then `repeat` every 80ms once it has been held 400ms, and nothing after release.
struct PressRepeatModifier: ViewModifier {
  let eventDispatcher: EventDispatcher
  @GestureState private var pressing = false
  @StateObject private var timer = RepeatTimer()

  func body(content: Content) -> some View {
    content
      // Simultaneous, so the Button underneath still gets its tap (and VoiceOver its action).
      .simultaneousGesture(
        DragGesture(minimumDistance: 0).updating($pressing) { _, state, _ in state = true }
      )
      .onChange(of: pressing) { pressing in
        guard pressing else { return timer.stop() }
        eventDispatcher([TYPE: ["type": "start"]])
        timer.start { eventDispatcher([TYPE: ["type": "repeat"]]) }
      }
  }
}

final class RepeatTimer: ObservableObject {
  private var timer: Timer?

  func start(_ tick: @escaping () -> Void) {
    stop()
    timer = Timer.scheduledTimer(withTimeInterval: 0.4, repeats: false) { [weak self] _ in
      tick()
      self?.timer = Timer.scheduledTimer(withTimeInterval: 0.08, repeats: true) { _ in tick() }
    }
  }

  func stop() {
    timer?.invalidate()
    timer = nil
  }

  deinit { stop() }
}
