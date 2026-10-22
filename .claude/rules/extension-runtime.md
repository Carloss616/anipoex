---
paths:
  - "modules/extension-runtime/**"
---

# Extension runtime: match Mihon's host

Extensions run against whatever the host puts on the classpath, so the host follows Mihon.

- **Libraries and versions come from Mihon's [`gradle/libs.versions.toml`](https://github.com/mihonapp/mihon/blob/main/gradle/libs.versions.toml)** (coroutines, OkHttp, jsoup, QuickJS, imagedecoder), capped only where a version needs a Kotlin compiler past the app's. A `NoSuchMethodError` or `NoClassDefFoundError` from an extension means the host is behind (`runBlockingK` came from coroutines 1.11).
- **Network classes are ports of Mihon's** (`@see` at the top of each); diff against the upstream file before changing behaviour. The client keeps cookies (`AndroidCookieJar`), and Android solves Cloudflare in a WebView. The JVM's `CloudflareInterceptor.jvm.kt` asks the app through `Host` (desktop: `desktop/challenge.js`; iOS: `ChallengeHost.swift`): the browser solves as itself, and that host's requests then go out from the solved page, since some sites tie the clearance to the browser's TLS fingerprint and refuse it from the JVM or curl. Never rewrite the challenge browser's user agent: Electron's with the `Electron/` token stripped reads as spoofed (no matching client hints) and Turnstile then refuses even a person's click; the stock one clears a challenge on its own in ~4 s.
- **Covers go out with the source's `HttpSource.headers`**, as Mihon's `MangaCoverFetcher` does: some image hosts refuse a request without the site's Referer. `installed()` hands them per source; desktop adds them in main (`desktop/covers.js`), since headers on a web `<img>` make it a CORS fetch. On Android, Glide's `GlideUrl` loader is the runtime's client (DNS over HTTPS, cookies).
- **Measure parity on the catalog, not one source**: scan the index's jars for classes the runtime lacks, and run install + popular + search across a language (`jvm/tools/smoke-install.ts` covers install). On the JVM the remaining gaps are `android.graphics` and WebView, which need a real image and browser engine, not shims.
