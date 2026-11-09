---
type: Persisted Store
title: Extension DNS
description: The resolver extensions look hosts up with, picked in Settings.
resource: ../../src/features/extensions/state/dns.ts
tags: [extensions, network, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

The choice is `device.dns` in [settings](settings.md): it belongs to this device and never
syncs. The runtime keeps its own copy, key `dns` in its `network` preferences (Android
SharedPreferences; a JSON file under the runtime's data dir on desktop and iOS), which the
app sets at launch and on every change. A device whose settings have no choice yet takes the
runtime's.

| Value | Resolver |
|---|---|
| `system` | The device's DNS |
| `cloudflare` | Cloudflare over HTTPS (default) |
| `google`, `adguard`, `quad9` | That provider over HTTPS |

DNS over HTTPS is the default because some ISPs' resolvers block manga sites (they answer
nothing for the site's host). A change applies to every source's
next lookup, no restart. A host the provider can't resolve (localhost, a LAN name, or the
provider being down) falls back to the system's DNS. A plain browser runs no extensions,
so web has no picker.
