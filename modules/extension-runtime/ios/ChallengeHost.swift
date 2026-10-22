import UIKit
import WebKit

/// What the runtime asks the app for through `IosHost.call`: a Cloudflare challenge solved in a WKWebView, then that site's
/// requests sent from the solved page. Some sites tie the clearance to the browser's own TLS fingerprint, which the JVM's
/// doesn't match, so a cookie alone doesn't get the runtime through; the page's own fetch does.
@MainActor
final class ChallengeHost {
  static let shared = ChallengeHost()

  // Under the runtime's 2-minute call timeout, which counts the time spent here.
  private static let solveSeconds: Double = 60
  // A challenge that wants a tap shows itself; most solve on their own before.
  private static let showAfterSeconds: Double = 8
  // A site's page stays loaded this long after its last request.
  private static let idleSeconds: Double = 600

  // Its own store: the pages are the sources' sites, not the app's.
  private let store = WKWebsiteDataStore.nonPersistent()
  private var pages: [String: (view: WKWebView, idle: Task<Void, Never>)] = [:]
  // The solve under way per host whose page closed: a second one would replace the first's page mid-fetch.
  private var reopening: [String: Task<Void, Error>] = [:]
  // Pages live in the window, off screen: WebKit pauses a page outside one.
  private lazy var shelf: UIView = {
    let shelf = UIView(frame: CGRect(x: -2000, y: 0, width: 390, height: 700))
    shelf.isUserInteractionEnabled = false
    // Off screen and not the app's: VoiceOver would read the site.
    shelf.accessibilityElementsHidden = true
    keyWindow?.addSubview(shelf)
    return shelf
  }()

  /// Safari's user agent: WKWebView's own leaves out the `Version` and `Safari` tokens, which a bot check notices.
  private let userAgent: String = {
    let version = UIDevice.current.systemVersion
    let os = version.replacingOccurrences(of: ".", with: "_")
    return "Mozilla/5.0 (iPhone; CPU iPhone OS \(os) like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/\(version) Mobile/15E148 Safari/604.1"
  }()

  /// Answers `IosHost.call` with a `{"result"}`/`{"error"}` envelope; blocks its runtime thread until the main thread is done.
  nonisolated static func answer(_ method: String, _ argsJson: String) -> String {
    let done = DispatchSemaphore(value: 0)
    let reply = Box()
    Task { @MainActor in
      do {
        let args = try JSONSerialization.jsonObject(with: Data(argsJson.utf8)) as? [String: Any] ?? [:]
        let result: Any = switch method {
        case "solveChallenge": try await shared.solve(url: args["url"] as? String ?? "")
        case "fetch": try await shared.fetch(args)
        default: throw HostError("Unknown host method \(method)")
        }
        reply.value = envelope(["result": result])
      } catch {
        reply.value = envelope(["error": (error as? HostError)?.message ?? error.localizedDescription])
      }
      done.signal()
    }
    done.wait()
    return reply.value
  }

  private func solve(url: String) async throws -> [String: Any] {
    guard let target = URL(string: url), ["http", "https"].contains(target.scheme), let host = target.host else {
      throw HostError("Not a web URL")
    }
    for cookie in await store.httpCookieStore.allCookies() where cookie.name == "cf_clearance" && host.hasSuffix(cookie.domain.trimmingCharacters(in: ["."])) {
      await store.httpCookieStore.deleteCookie(cookie)
    }
    let configuration = WKWebViewConfiguration()
    configuration.websiteDataStore = store
    let view = WKWebView(frame: shelf.bounds, configuration: configuration)
    view.customUserAgent = userAgent
    shelf.addSubview(view)
    view.load(URLRequest(url: target))
    var sheet: UIViewController?
    let started = Date()
    defer { sheet?.dismiss(animated: true) }
    while Date().timeIntervalSince(started) < Self.solveSeconds {
      let cookies = await store.httpCookieStore.allCookies().filter { host.hasSuffix($0.domain.trimmingCharacters(in: ["."])) }
      if cookies.contains(where: { $0.name == "cf_clearance" }) {
        view.frame = shelf.bounds
        shelf.addSubview(view)
        await settle(view, until: started.addingTimeInterval(Self.solveSeconds))
        keep(view, for: host)
        return ["cookies": cookies.map(Self.setCookie), "userAgent": userAgent]
      }
      if sheet == nil, Date().timeIntervalSince(started) > Self.showAfterSeconds {
        sheet = present(view)
      }
      if sheet != nil, sheet?.presentingViewController == nil { break }
      try await Task.sleep(for: .milliseconds(500))
    }
    view.removeFromSuperview()
    throw HostError(sheet?.presentingViewController == nil && sheet != nil ? "Cloudflare check closed" : "Cloudflare check timed out")
  }

  /// Waits for the reload Cloudflare does once cleared: a page's JavaScript dies with it, so the page is used once it's the site's.
  private func settle(_ view: WKWebView, until deadline: Date) async {
    while Date() < deadline {
      let title = try? await view.evaluateJavaScript("document.title") as? String
      if !view.isLoading, let title, title != "Just a moment..." { return }
      try? await Task.sleep(for: .milliseconds(250))
    }
  }

  private func fetch(_ args: [String: Any]) async throws -> [String: Any] {
    guard let url = args["url"] as? String, let host = URL(string: url)?.host else { throw HostError("Not a web URL") }
    // Closed while idle: solving again reopens it, once for the requests that find it closed together.
    if pages[host] == nil {
      let solving = reopening[host] ?? Task { [self] in
        defer { reopening[host] = nil }
        _ = try await solve(url: url)
      }
      reopening[host] = solving
      try await solving.value
    }
    guard let view = pages[host]?.view else { throw HostError("The site's page is gone") }
    keep(view, for: host)
    let headers = (args["headers"] as? [[String]] ?? []).filter { $0.count == 2 }
    // The page's fetch drops a Cookie header, so the runtime's cookies join the page's store.
    let known = Set(await store.httpCookieStore.allCookies().map(\.name))
    for pair in (headers.first { $0[0].lowercased() == "cookie" }?[1] ?? "").split(separator: ";") {
      let parts = pair.trimmingCharacters(in: .whitespaces).split(separator: "=", maxSplits: 1).map(String.init)
      guard parts.count == 2, !known.contains(parts[0]),
            let cookie = HTTPCookie(properties: [.name: parts[0], .value: parts[1], .domain: host, .path: "/"]) else { continue }
      await store.httpCookieStore.setCookie(cookie)
    }
    let sent = headers.filter { !Self.forbidden.contains($0[0].lowercased()) }
    let reply: Any?
    do {
      reply = try await view.callAsyncJavaScript(
        Self.pageFetch,
        arguments: ["method": args["method"] as? String ?? "GET", "url": url, "headers": sent, "body": args["body"] as? String ?? NSNull()],
        contentWorld: .page
      )
    } catch {
      // WebKit's own message names what the page threw.
      throw HostError((error as NSError).userInfo["WKJavaScriptExceptionMessage"] as? String ?? error.localizedDescription)
    }
    guard var result = reply as? [String: Any] else { throw HostError("The page's fetch returned nothing") }
    // fetch already decoded the body, so its encoding and length would lie.
    result["headers"] = (result["headers"] as? [[String]] ?? []).filter { !["content-encoding", "content-length"].contains($0[0]) }
    return result
  }

  private func keep(_ view: WKWebView, for host: String) {
    if let page = pages[host], page.view !== view {
      page.view.removeFromSuperview()
    }
    pages[host]?.idle.cancel()
    let idle = Task { @MainActor [weak self] in
      try? await Task.sleep(for: .seconds(Self.idleSeconds))
      guard !Task.isCancelled else { return }
      self?.pages[host]?.view.removeFromSuperview()
      self?.pages[host] = nil
    }
    pages[host] = (view, idle)
  }

  /// Shows the page for a person to solve, in a sheet they can close.
  private func present(_ view: WKWebView) -> UIViewController? {
    guard var top = keyWindow?.rootViewController else { return nil }
    while let presented = top.presentedViewController { top = presented }
    let sheet = UIViewController()
    sheet.title = "Verifying the site…"
    view.frame = sheet.view.bounds
    view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    sheet.view.addSubview(view)
    let navigation = UINavigationController(rootViewController: sheet)
    sheet.navigationItem.leftBarButtonItem = UIBarButtonItem(systemItem: .cancel, primaryAction: UIAction { [weak navigation] _ in
      navigation?.dismiss(animated: true)
    })
    top.present(navigation, animated: true)
    return navigation
  }

  private var keyWindow: UIWindow? {
    UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow }.first
  }

  private static func setCookie(_ cookie: HTTPCookie) -> String {
    var parts = ["\(cookie.name)=\(cookie.value)", "Domain=\(cookie.domain)", "Path=\(cookie.path)"]
    if let expires = cookie.expiresDate { parts.append("Max-Age=\(max(0, Int(expires.timeIntervalSinceNow)))") }
    return parts.joined(separator: "; ")
  }

  // A page's fetch refuses these; the browser sends its own.
  private static let forbidden: Set<String> = ["cookie", "user-agent", "referer", "host", "connection", "accept-encoding", "content-length"]

  // The page's own same-origin fetch, so WebKit adds the cookies and headers it sends for the site itself. Bodies travel as base64.
  private static let pageFetch = """
    const bytes = body ? Uint8Array.from(atob(body), (c) => c.charCodeAt(0)) : undefined;
    const response = await fetch(url, { method, headers, body: bytes, credentials: "include" });
    const data = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
    return { status: response.status, headers: [...response.headers], body: btoa(binary) };
    """

  private static func envelope(_ object: [String: Any]) -> String {
    guard let data = try? JSONSerialization.data(withJSONObject: object), let json = String(data: data, encoding: .utf8) else {
      return #"{"error":"Could not encode the host's reply"}"#
    }
    return json
  }
}

private struct HostError: Error {
  let message: String
  init(_ message: String) { self.message = message }
}

private final class Box: @unchecked Sendable {
  var value = #"{"error":"The host did not answer"}"#
}
