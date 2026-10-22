---
type: Persisted Store
title: Extension cookies
description: The cookies sites set for extensions, shared by every source and kept by the runtime like a browser's.
resource: ../../modules/extension-runtime/android/src/main/java/eu/kanade/tachiyomi/network/AndroidCookieJar.kt
tags: [extensions, network, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

Every extension request sends and keeps cookies like a browser, as in Mihon. Many sites
need it: a "verifying your browser" page that sets a cookie and reloads, a
session token a search form checks (HTTP 419 without it), or Cloudflare's `cf_clearance`.

On Android they live in the system WebView's cookie store, so they survive restarts and a
WebView sees them too. There, a Cloudflare challenge page is solved in a hidden WebView,
and its `cf_clearance` cookie lets the request through; an interactive challenge (a
captcha) or a failed one shows as the call's error.

On desktop and iOS they live in memory only, so a restart drops them and the first request
earns them again. There, the challenge is solved by the app's own browser (a hidden window on
desktop, a hidden web view on iOS), shown when it asks for a click or tap. That site's
requests then go out from the solved page for as long as it stays open (10 minutes idle).
