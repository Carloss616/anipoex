---
type: Persisted Store
title: Challenged sources
description: Sources whose site has answered with a Cloudflare challenge; they load slower.
resource: ../../src/features/manga/state/challenged.ts
tags: [sources, cloudflare, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-09T00:00:00Z }
---

Key `source-challenged`: `{ [sourceId]: firstSeen }`, epoch ms.

The extension runtime notes every host that answers a request with a Cloudflare challenge
(the `cf-mitigated: challenge` header), on Android, desktop and iOS. When a scan ends, a
source is marked when its homepage is on one of those hosts (the same domain, `www.` or a
subdomain either way). A mark is never removed: a site that challenged once is likely to
again.

A source whose requests go to a host unrelated to its homepage is not marked.

Marked sources rank after unmarked ones with the same new chapters (see
[source](../concepts/source.md)), and their row in the source sheet shows Cloudflare's logo
(read out as "Cloudflare").
