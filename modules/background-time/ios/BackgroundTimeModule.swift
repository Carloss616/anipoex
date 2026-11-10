import ExpoModulesCore
import UIKit

/// Keeps work the user started running off screen until it ends or iOS's
/// grace time (about 30s) runs out.
public class BackgroundTimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackgroundTime")

    Function("begin") { (name: String) -> Int in
      var task = UIBackgroundTaskIdentifier.invalid
      task = UIApplication.shared.beginBackgroundTask(withName: name) {
        UIApplication.shared.endBackgroundTask(task)
      }
      return task.rawValue
    }

    Function("end") { (task: Int) in
      UIApplication.shared.endBackgroundTask(UIBackgroundTaskIdentifier(rawValue: task))
    }

    // Seconds left off screen; in the foreground iOS reports no limit at all.
    AsyncFunction("remaining") { () -> Double in
      UIApplication.shared.backgroundTimeRemaining
    }.runOnQueue(.main)
  }
}
