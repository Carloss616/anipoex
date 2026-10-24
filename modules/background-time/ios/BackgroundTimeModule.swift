import ExpoModulesCore
import UIKit

/// Work the user started keeps running after the app leaves the screen, until it ends or iOS's grace time (about 30s) runs out.
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
  }
}
