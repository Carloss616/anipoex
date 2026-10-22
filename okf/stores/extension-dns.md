---
type: Persisted Store
title: Extension DNS
description: The resolver extensions look hosts up with, picked on Home until a settings page exists.
resource: ../../modules/extension-runtime/android/src/main/java/eu/kanade/tachiyomi/network/NetworkHelper.kt
tags: [extensions, network, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

Key `dns` in the extension runtime's own `network` preferences (Android SharedPreferences;
a JSON file under the runtime's data dir on desktop and iOS), not in MMKV.

| Value | Resolver |
|---|---|
| `system` | The device's DNS |
| `cloudflare` | Cloudflare over HTTPS (default) |
| `google`, `adguard`, `quad9` | That provider over HTTPS |

DNS over HTTPS is the default because some ISPs' resolvers block manga sites (the test
phone's Wi-Fi DNS returns nothing for one source's host). A change applies to every source's
next lookup, no restart. A host the provider can't resolve (localhost, a LAN name, or the
provider being down) falls back to the system's DNS. A plain browser runs no extensions,
so web has no picker.
