import UIKit
import WebKit

/// The runtime's `android.webkit.WebView` (`wv*` calls through `IosHost.call`): a WKWebView per WebView, off screen in the
/// key window. What the page does reaches the runtime as events it long-polls with `wvEvents`.
@MainActor
final class WebViewHost {
  static let shared = WebViewHost()

  // How long `wvEvents` waits for an event before it answers none.
  static let pollSeconds: Double = 20

  // One store for every WebView, as Android's CookieManager is the app's; not the challenge's, whose pages are its own.
  private let store = WKWebsiteDataStore.nonPersistent()
  private var pages: [Int: WebViewPage] = [:]
  private var nextId = 0
  private var blocker: WKContentRuleList?
  private var watcher: CookieWatcher?
  private var reporting: Task<Void, Never>?
  // The last report, by name, domain and path: one missing from the next was deleted (a logout, a rotated session).
  private var reported: [String: [String: Any]] = [:]

  // Android's blockNetworkImage: only network images, a data: one still shows.
  private static let blockImages = #"[{"trigger":{"url-filter":"^https?:","resource-type":["image"]},"action":{"type":"block"}}]"#

  /// Answers `IosHost.call` with a `{"result"}`/`{"error"}` envelope; blocks its runtime thread until the main thread is done.
  nonisolated static func answer(_ method: String, _ argsJson: String) -> String {
    let done = DispatchSemaphore(value: 0)
    let reply = Box()
    Task { @MainActor in
      do {
        let args = try JSONSerialization.jsonObject(with: Data(argsJson.utf8)) as? [String: Any] ?? [:]
        reply.value = ChallengeHost.envelope(["result": try await shared.call(method, args)])
      } catch {
        reply.value = ChallengeHost.envelope(["error": (error as? HostError)?.message ?? error.localizedDescription])
      }
      done.signal()
    }
    done.wait()
    return reply.value
  }

  private func call(_ method: String, _ args: [String: Any]) async throws -> Any {
    let id = (args["id"] as? NSNumber)?.intValue ?? -1
    switch method {
    case "wvCreate":
      watchCookies()
      nextId += 1
      let page = WebViewPage(store: store, frame: ChallengeHost.shared.shelf.bounds)
      ChallengeHost.shared.shelf.addSubview(page.view)
      pages[nextId] = page
      return ["id": nextId, "userAgent": ChallengeHost.userAgent]
    case "wvEvents":
      guard let page = pages[id] else { return ["events": [], "closed": true] }
      let reply = await page.poll()
      if page.closed { pages[id] = nil }
      return reply
    case "wvRespond":
      // iOS can't hold a page's http(s) request: its `request` events only report it, and the answer changes nothing.
      return NSNull()
    case "wvStop":
      pages[id]?.view.stopLoading()
      return NSNull()
    case "wvDestroy":
      // The JVM stops polling at destroy, so the page goes now; a late poll gets `closed`.
      pages[id]?.close()
      pages[id] = nil
      return NSNull()
    case "wvLoad", "wvLoadData":
      guard let page = pages[id] else { throw HostError("This WebView is closed") }
      try await load(page, args, data: method == "wvLoadData")
      return NSNull()
    case "wvEvaluate":
      guard let page = pages[id] else { throw HostError("This WebView is closed") }
      return await page.evaluate(args["script"] as? String ?? "")
    default:
      throw HostError("Unknown host method \(method)")
    }
  }

  private func load(_ page: WebViewPage, _ args: [String: Any], data: Bool) async throws {
    let settings = args["settings"] as? [String: Any] ?? [:]
    page.apply(settings, blocker: settings["blockImages"] as? Bool == true ? await imageBlocker() : nil)
    for cookie in (args["cookies"] as? [[String: Any]] ?? []).compactMap(Self.cookie) {
      await store.httpCookieStore.setCookie(cookie)
    }
    guard !page.closed else { throw HostError("This WebView is closed") }
    if data {
      let base = URL(string: args["baseUrl"] as? String ?? "") ?? URL(string: "about:blank")!
      let mimeType = (args["mimeType"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? "text/html"
      // `data` arrives as a decoded string, so its bytes are UTF-8 whatever `encoding` it came with.
      page.view.load(Data((args["data"] as? String ?? "").utf8), mimeType: mimeType, characterEncodingName: "utf-8", baseURL: base)
    } else {
      guard let url = URL(string: args["url"] as? String ?? "") else { throw HostError("Not a URL") }
      var request = URLRequest(url: url)
      for (name, value) in args["headers"] as? [String: String] ?? [:] {
        request.setValue(value, forHTTPHeaderField: name)
      }
      page.view.load(request)
    }
  }

  private func imageBlocker() async -> WKContentRuleList? {
    if blocker == nil {
      blocker = try? await WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "block-network-images", encodedContentRuleList: Self.blockImages)
    }
    return blocker
  }

  private static func cookie(_ fields: [String: Any]) -> HTTPCookie? {
    guard let name = fields["name"] as? String, let value = fields["value"] as? String, let domain = fields["domain"] as? String else { return nil }
    let bare = domain.trimmingCharacters(in: ["."])
    var properties: [HTTPCookiePropertyKey: Any] = [
      .name: name,
      .value: value,
      .path: fields["path"] as? String ?? "/",
      // A domain without a leading dot is that host only.
      .domain: fields["hostOnly"] as? Bool == true ? bare : "." + bare,
    ]
    if let expiresAt = fields["expiresAt"] as? NSNumber {
      properties[.expires] = Date(timeIntervalSince1970: expiresAt.doubleValue / 1000)
    }
    if fields["secure"] as? Bool == true { properties[.secure] = "TRUE" }
    if fields["httpOnly"] as? Bool == true { properties[HTTPCookiePropertyKey("HttpOnly")] = "TRUE" }
    return HTTPCookie(properties: properties)
  }

  // A request after a page finished can set the cookie a source needs (its session): every live WebView reports the
  // store's cookies when it changes, as Android's app-wide CookieManager would already hold them.
  private func watchCookies() {
    guard watcher == nil else { return }
    let watcher = CookieWatcher { [weak self] in
      guard let self else { return }
      self.reporting?.cancel()
      self.reporting = Task { @MainActor in
        let cookies = await self.store.httpCookieStore.allCookies().map(Self.fields)
        guard !Task.isCancelled else { return }
        let now = Dictionary(cookies.map { (Self.key($0), $0) }, uniquingKeysWith: { _, last in last })
        // Expired, so the runtime's CookieManager drops it too.
        let deleted = self.reported.filter { now[$0.key] == nil }.values.map { $0.merging(["expiresAt": 0]) { _, zero in zero } }
        self.reported = now
        for page in self.pages.values { page.emit(["type": "cookies", "cookies": cookies + deleted]) }
      }
    }
    store.httpCookieStore.add(watcher)
    self.watcher = watcher
  }

  /// What the store holds for `url`, in the runtime's cookie shape.
  static func cookies(in store: WKWebsiteDataStore, for url: URL?) async -> [[String: Any]] {
    guard let url, let host = url.host?.lowercased() else { return [] }
    let path = url.path.isEmpty ? "/" : url.path
    return await store.httpCookieStore.allCookies().filter { cookie in
      let domain = cookie.domain.lowercased()
      let matches = domain.hasPrefix(".") ? host == domain.dropFirst() || host.hasSuffix(domain) : host == domain
      return matches && path.hasPrefix(cookie.path)
    }.map(fields)
  }

  private static func key(_ fields: [String: Any]) -> String {
    "\(fields["name"] ?? "")|\(fields["domain"] ?? "")|\(fields["path"] ?? "")"
  }

  static func fields(_ cookie: HTTPCookie) -> [String: Any] {
    [
      "name": cookie.name,
      "value": cookie.value,
      "domain": cookie.domain.trimmingCharacters(in: ["."]),
      "path": cookie.path,
      "expiresAt": cookie.expiresDate.map { Int64($0.timeIntervalSince1970 * 1000) } ?? NSNull(),
      "secure": cookie.isSecure,
      "httpOnly": cookie.isHTTPOnly,
      "hostOnly": !cookie.domain.hasPrefix("."),
    ]
  }
}

/// Calls back when the cookie store changes; WebKit's observer has to be an NSObject.
private final class CookieWatcher: NSObject, WKHTTPCookieStoreObserver {
  private let changed: @MainActor () -> Void

  init(_ changed: @escaping @MainActor () -> Void) {
    self.changed = changed
  }

  func cookiesDidChange(in cookieStore: WKHTTPCookieStore) {
    Task { @MainActor in changed() }
  }
}

/// One WebView: its WKWebView and the events queued for the runtime's next poll. Popups are refused by having no
/// WKUIDelegate, which opens no window.
@MainActor
private final class WebViewPage: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
  let view: WKWebView
  private(set) var closed = false
  private let controller = WKUserContentController()
  private var queue: [[String: Any]] = []
  private var waiter: CheckedContinuation<Void, Never>?
  private var timeout: Task<Void, Never>?
  private var javaScriptEnabled = true

  private var nextRequest = 0
  private var bridgeCalls: Task<Void, Never>?

  init(store: WKWebsiteDataStore, frame: CGRect) {
    let configuration = WKWebViewConfiguration()
    configuration.websiteDataStore = store
    configuration.userContentController = controller
    // Never shown, so nothing plays: media waits for a tap no one makes, inline rather than full screen.
    configuration.mediaTypesRequiringUserActionForPlayback = .all
    configuration.allowsInlineMediaPlayback = true
    view = WKWebView(frame: frame, configuration: configuration)
    super.init()
    view.customUserAgent = ChallengeHost.userAgent
    view.navigationDelegate = self
    controller.add(self, name: Self.jsHandler)
    controller.add(self, name: Self.consoleHandler)
    controller.add(self, name: Self.requestHandler)
  }

  /// A load's settings, from that load on: user scripts run from the next document.
  func apply(_ settings: [String: Any], blocker: WKContentRuleList?) {
    // WebKit can't pass for Chromium: a Chrome user agent on it reads as spoofed and bot checks refuse the page, so it
    // keeps Safari's, which the engine matches.
    let userAgent = settings["userAgent"] as? String
    view.customUserAgent = userAgent.flatMap { $0.contains("Chrome/") ? nil : $0 } ?? ChallengeHost.userAgent
    javaScriptEnabled = settings["javaScriptEnabled"] as? Bool ?? true
    controller.removeAllContentRuleLists()
    if let blocker { controller.add(blocker) }
    var interfaces: [String: [String]] = [:]
    for interface in settings["interfaces"] as? [[String: Any]] ?? [] {
      if let name = interface["name"] as? String { interfaces[name] = interface["methods"] as? [String] ?? [] }
    }
    let json = (try? JSONSerialization.data(withJSONObject: interfaces)).map { String(decoding: $0, as: UTF8.self) } ?? "{}"
    controller.removeAllUserScripts()
    controller.addUserScript(WKUserScript(source: Self.console, injectionTime: .atDocumentStart, forMainFrameOnly: false))
    controller.addUserScript(WKUserScript(source: "(\(Self.bridge))(\(json));", injectionTime: .atDocumentStart, forMainFrameOnly: false))
    controller.addUserScript(WKUserScript(source: Self.requests, injectionTime: .atDocumentStart, forMainFrameOnly: false))
  }

  /// Android's evaluateJavascript: the completion value as JSON, "null" for anything JSON can't hold or a thrown error.
  func evaluate(_ script: String) async -> String {
    // The completion-handler form: the async one traps when the script's value is undefined.
    await withCheckedContinuation { continuation in
      view.evaluateJavaScript(script) { value, _ in
        continuation.resume(returning: Self.json(value))
      }
    }
  }

  /// The queued events, waiting up to `pollSeconds` for one.
  func poll() async -> [String: Any] {
    if queue.isEmpty, !closed {
      // A poll already waiting answers empty: the newer one gets what comes next.
      wake()
      timeout = Task { [weak self] in
        try? await Task.sleep(for: .seconds(WebViewHost.pollSeconds))
        if !Task.isCancelled { self?.wake() }
      }
      await withCheckedContinuation { waiter = $0 }
    }
    let events = queue
    queue = []
    return ["events": events, "closed": closed]
  }

  func close() {
    guard !closed else { return }
    closed = true
    view.stopLoading()
    view.navigationDelegate = nil
    // The controller holds its handlers strongly: this page, which holds the view that holds the controller.
    controller.removeAllScriptMessageHandlers()
    controller.removeAllUserScripts()
    view.removeFromSuperview()
    wake()
  }

  func emit(_ event: [String: Any]) {
    guard !closed else { return }
    queue.append(event)
    wake()
  }

  private func wake() {
    timeout?.cancel()
    timeout = nil
    let waiting = waiter
    waiter = nil
    waiting?.resume()
  }

  func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, preferences: WKWebpagePreferences,
               decisionHandler: @escaping @MainActor (WKNavigationActionPolicy, WKWebpagePreferences) -> Void) {
    preferences.allowsContentJavaScript = javaScriptEnabled
    let request = navigationAction.request
    if let url = request.url, ["http", "https"].contains(url.scheme) {
      report(url.absoluteString, method: request.httpMethod ?? "GET", headers: request.allHTTPHeaderFields ?? [:],
             mainFrame: navigationAction.targetFrame?.isMainFrame ?? true)
    }
    decisionHandler(.allow, preferences)
  }

  func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
    emit(["type": "pageStarted", "url": webView.url?.absoluteString ?? ""])
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    let url = webView.url
    let store = webView.configuration.websiteDataStore
    Task {
      let cookies = await WebViewHost.cookies(in: store, for: url)
      emit(["type": "pageFinished", "url": url?.absoluteString ?? "", "cookies": cookies])
    }
  }

  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    failed(error)
  }

  func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    failed(error)
  }

  // Only the main frame's: WebKit tells a navigation delegate nothing about a subresource or a frame failing.
  private func failed(_ error: Error) {
    let error = error as NSError
    // A stop or a load replaced by another, which Android doesn't report either.
    guard error.code != NSURLErrorCancelled else { return }
    let url = error.userInfo[NSURLErrorFailingURLStringErrorKey] as? String ?? view.url?.absoluteString ?? ""
    emit(["type": "error", "url": url, "description": error.localizedDescription, "mainFrame": true])
  }

  func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
    // WebKit doesn't say whether the process crashed or was reclaimed for memory.
    emit(["type": "gone", "crashed": true])
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    // The page's own data: anything off-shape is dropped or coerced.
    guard let body = message.body as? [String: Any] else { return }
    if message.name == Self.consoleHandler {
      let level = body["level"] as? String ?? "log"
      emit([
        "type": "console",
        "level": ["log", "info", "warn", "error", "debug"].contains(level) ? level : "log",
        "message": body["message"] as? String ?? "",
        "source": body["source"] as? String ?? "",
        "line": (body["line"] as? NSNumber)?.intValue ?? 0,
      ])
    } else if message.name == Self.requestHandler {
      guard let url = body["url"] as? String else { return }
      report(url, method: body["method"] as? String ?? "GET", headers: body["headers"] as? [String: String] ?? [:], mainFrame: false)
    } else if let name = body["name"] as? String, let method = body["method"] as? String {
      // The store's cookies go first: WebKit tells about new ones after the page's message that follows them (a page
      // posting "passed" once its session is set), and the extension's next request needs them. Chained, in order.
      let store = message.webView?.configuration.websiteDataStore.httpCookieStore
      let previous = bridgeCalls
      bridgeCalls = Task { @MainActor in
        await previous?.value
        if let store { emit(["type": "cookies", "cookies": await store.allCookies().map(WebViewHost.fields)]) }
        emit(["type": "js", "name": name, "method": method, "args": body["args"] as? [String] ?? []])
      }
    }
  }

  // shortcut: WebKit can't hold http(s) requests, so a request is only reported (navigations, and the page's fetch and
  // XHR; not images or scripts) and an interceptor's response is dropped; enough for sources that read an API call.
  private func report(_ url: String, method: String, headers: [String: String], mainFrame: Bool) {
    nextRequest += 1
    emit(["type": "request", "requestId": nextRequest, "url": url, "method": method.uppercased(), "headers": headers, "mainFrame": mainFrame])
  }

  nonisolated private static func json(_ value: Any?) -> String {
    // The array check keeps an unserializable value (a date) from raising inside JSONSerialization.
    guard let value, JSONSerialization.isValidJSONObject([value]),
          let data = try? JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed, .withoutEscapingSlashes]) else { return "null" }
    return String(decoding: data, as: UTF8.self)
  }

  private static let jsHandler = "anipoexInterface"
  private static let consoleHandler = "anipoexConsole"
  private static let requestHandler = "anipoexRequest"

  // The page's fetch and XHR calls, reported as they're made; a WeakMap keeps nothing on the page's own objects.
  private static let requests = """
    (() => {
      const handler = webkit.messageHandlers.\(requestHandler);
      const post = (url, method, headers) => {
        try { handler.postMessage({ url: new URL(url, location.href).href, method: method || "GET", headers }); } catch {}
      };
      const headersOf = (init) => {
        const out = {};
        try { new Headers(init || {}).forEach((value, name) => { out[name] = value; }); } catch {}
        return out;
      };
      const fetch = window.fetch;
      window.fetch = function (input, init) {
        const request = input instanceof Request ? input : null;
        post(request ? request.url : String(input), (init && init.method) || (request && request.method),
          headersOf((init && init.headers) || (request && request.headers)));
        return fetch.apply(this, arguments);
      };
      const calls = new WeakMap();
      const { open, setRequestHeader, send } = XMLHttpRequest.prototype;
      XMLHttpRequest.prototype.open = function (method, url) {
        calls.set(this, { method, url: String(url), headers: {} });
        return open.apply(this, arguments);
      };
      XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        const call = calls.get(this);
        if (call) call.headers[String(name).toLowerCase()] = String(value);
        return setRequestHeader.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function () {
        const call = calls.get(this);
        if (call) post(call.url, call.method, call.headers);
        return send.apply(this, arguments);
      };
    })();
    """

  // Fire and forget, as the protocol has no return value; the handler is taken first, so a page that drops
  // `window.webkit` still reaches it.
  private static let bridge = """
    (interfaces) => {
      const handler = webkit.messageHandlers.\(jsHandler);
      for (const [name, methods] of Object.entries(interfaces)) {
        const target = (window[name] = {});
        for (const method of methods) {
          target[method] = (...args) => { handler.postMessage({ name, method, args: args.map(String) }); };
        }
      }
    }
    """

  // shortcut: every message's source is the page and its line 0, read the caller from `new Error().stack` if a source needs them.
  private static let console = """
    (() => {
      const handler = webkit.messageHandlers.\(consoleHandler);
      const post = (level, message, source, line) => {
        try { handler.postMessage({ level, message, source, line }); } catch {}
      };
      for (const level of ["log", "info", "warn", "error", "debug"]) {
        const original = console[level];
        console[level] = function (...args) {
          try { post(level, args.map(String).join(" "), location.href, 0); } catch {}
          return original.apply(this, args);
        };
      }
      addEventListener("error", (event) => post("error", event.message, event.filename, event.lineno));
    })();
    """
}
