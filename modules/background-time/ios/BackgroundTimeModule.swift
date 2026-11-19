import BackgroundTasks
import ExpoModulesCore
import UIKit

/// Keeps work the user started running off screen until it ends or iOS's
/// grace time (about 30s) runs out; on iOS 26 a continued processing task
/// keeps it going past that, the phone locked included.
///
/// The continued task follows react-native-continued-task: one identifier per
/// task under the `.*` wildcard (each registered once, or iOS kills the app),
/// the entry kept before submit, progress reported throughout.
/// https://github.com/mahdidavoodi7/react-native-continued-task/tree/main/ios
public class BackgroundTimeModule: Module {
  /// Continued tasks by work name; main queue only.
  private var continued: [String: Continued] = [:]

  public func definition() -> ModuleDefinition {
    Name("BackgroundTime")

    Events("onExpire")

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

    // False where iOS refuses one: before iOS 26, in the Simulator, or with
    // Background App Refresh off.
    AsyncFunction("beginContinued") { (name: String, title: String) -> Bool in
      guard #available(iOS 26.0, *) else { return false }
      return self.submit(name: name, title: title)
    }.runOnQueue(.main)

    AsyncFunction("progressContinued") { (name: String, fraction: Double) in
      guard let entry = self.continued[name] else { return }
      entry.fraction = fraction
      if #available(iOS 26.0, *) { entry.show() }
    }.runOnQueue(.main)

    AsyncFunction("endContinued") { (name: String) in
      guard let entry = self.continued.removeValue(forKey: name) else { return }
      if #available(iOS 26.0, *) { entry.finish() }
    }.runOnQueue(.main)
  }

  @available(iOS 26.0, *)
  private func submit(name: String, title: String) -> Bool {
    let bundle = Bundle.main.bundleIdentifier ?? ""
    let id = "\(bundle).work.\(UUID().uuidString)"
    let entry = Continued(id: id)
    let registered = BGTaskScheduler.shared.register(forTaskWithIdentifier: id, using: .main) {
      [weak self] task in
      guard let task = task as? BGContinuedProcessingTask, self?.continued[name] === entry else {
        task.setTaskCompleted(success: false)
        return
      }
      entry.task = task
      entry.show()
      // Also how a cancel from the system's own UI arrives.
      task.expirationHandler = {
        DispatchQueue.main.async {
          guard let self, self.continued[name] === entry else { return }
          self.continued[name] = nil
          task.setTaskCompleted(success: false)
          self.sendEvent("onExpire", ["name": name])
        }
      }
    }
    guard registered else { return false }
    let request = BGContinuedProcessingTaskRequest(identifier: id, title: title, subtitle: "In progress")
    // Now or never: queued for later, the work it was for would be done.
    request.strategy = .fail
    continued[name] = entry
    do {
      try BGTaskScheduler.shared.submit(request)
      return true
    } catch {
      continued[name] = nil
      return false
    }
  }
}

private final class Continued {
  let id: String
  var fraction = 0.0
  /// The BGContinuedProcessingTask once iOS launches it.
  var task: AnyObject?

  init(id: String) {
    self.id = id
  }

  @available(iOS 26.0, *)
  func show() {
    guard let task = task as? BGContinuedProcessingTask else { return }
    task.progress.totalUnitCount = 100
    task.progress.completedUnitCount = Int64((fraction * 100).rounded())
  }

  @available(iOS 26.0, *)
  func finish() {
    if let task = task as? BGContinuedProcessingTask {
      task.setTaskCompleted(success: true)
    } else {
      BGTaskScheduler.shared.cancel(taskRequestWithIdentifier: id)
    }
  }
}
