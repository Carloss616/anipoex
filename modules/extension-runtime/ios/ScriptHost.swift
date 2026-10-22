import Foundation
import JavaScriptCore

/// The runtime's JavaScript engine (QuickJs on the JVM): one JSContext per engine, which runs a script as QuickJS does
/// (a `class` or `let` stays for the next one) and has no network or DOM. Results come back as QuickJS gives them:
/// strings, numbers, booleans and arrays of them; anything else is null.
enum ScriptHost {
  private static let lock = NSLock()
  private static var contexts: [Int: JSContext] = [:]
  private static var nextId = 0
  private static let machine = JSVirtualMachine()

  /// Answers `IosHost.call` for `jsCreate`, `jsEvaluate` and `jsClose` with a `{"result"}`/`{"error"}` envelope.
  static func answer(_ method: String, _ argsJson: String) -> String {
    let args = (try? JSONSerialization.jsonObject(with: Data(argsJson.utf8))) as? [String: Any] ?? [:]
    let id = (args["id"] as? NSNumber)?.intValue ?? -1
    switch method {
    case "jsCreate":
      guard let context = JSContext(virtualMachine: machine) else { return ChallengeHost.envelope(["error": "Could not start JavaScript"]) }
      // An uncaught error lands here instead of the console; the evaluation reads it back.
      context.exceptionHandler = { context, exception in context?.exception = exception }
      lock.lock()
      nextId += 1
      let created = nextId
      contexts[created] = context
      lock.unlock()
      return ChallengeHost.envelope(["result": created])
    case "jsEvaluate":
      lock.lock()
      let context = contexts[id]
      lock.unlock()
      guard let context else { return ChallengeHost.envelope(["error": "This JavaScript engine is closed"]) }
      context.exception = nil
      let value = context.evaluateScript(args["script"] as? String ?? "")
      if let exception = context.exception {
        return ChallengeHost.envelope(["error": exception.toString() ?? "The script failed"])
      }
      return ChallengeHost.envelope(["result": plain(value)])
    case "jsClose":
      lock.lock()
      contexts[id] = nil
      lock.unlock()
      return ChallengeHost.envelope(["result": NSNull()])
    default:
      return ChallengeHost.envelope(["error": "Unknown host method \(method)"])
    }
  }

  private static func plain(_ value: JSValue?) -> Any {
    guard let value else { return NSNull() }
    if value.isString { return value.toString() ?? NSNull() }
    if value.isBoolean { return value.toBool() }
    if value.isNumber {
      let number = value.toDouble()
      return number.isFinite ? number : NSNull()
    }
    if value.isArray {
      let length = Int(value.forProperty("length")?.toInt32() ?? 0)
      return (0..<length).map { plain(value.atIndex($0)) }
    }
    return NSNull()
  }
}
