import ExpoModulesCore

public class ExtensionRuntimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExtensionRuntime")

    // The runtime has no browser: a Cloudflare challenge is solved in a WKWebView, and that site is fetched through it.
    OnCreate {
      AnipoexSetHostHandler { method, argsJson in ChallengeHost.answer(method, argsJson) }
    }

    // Resolves the raw `{result}`/`{error}` envelope; the JS bridge turns it into a value or an Error.
    AsyncFunction("call") { (method: String, argsJson: String, promise: Promise) in
      guard let jars = Bundle(for: ExtensionRuntimeModule.self).url(forResource: "ExtensionRuntime", withExtension: "bundle") else {
        promise.resolve(#"{"error":"Extension runtime failed to start: ExtensionRuntime.bundle is missing from the app"}"#)
        return
      }
      guard let frameworks = Bundle.main.privateFrameworksURL else {
        promise.resolve(#"{"error":"Extension runtime failed to start: the app has no Frameworks folder"}"#)
        return
      }
      let framework = frameworks.appendingPathComponent("AnipoexJDK.framework")
      let data = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("extensions")
      // Zero turns a stack overflow into a crash instead of a StackOverflowError, and a GCD thread has only 512 KiB.
      let thread = Thread {
        promise.resolve(AnipoexJvmCall(method, argsJson, framework, jars, data))
      }
      thread.stackSize = 8 << 20
      thread.start()
    }
  }
}
