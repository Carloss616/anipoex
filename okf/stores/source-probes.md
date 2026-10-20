---
type: Persisted Store
title: Source probes
description: What the last scan learned about each source for each manga.
resource: ../../src/features/manga/state/probes.ts
tags: [sources, probes, persistence]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-20T00:00:00Z }
---

Key `msu-probes`: `{ [anilistId]: { [sourceId]: probe } }`, one [source probe](../concepts/source-probe.md)
per source, written as each one lands.

Probes are written only when the user scans (the refresh button for every source, Rescan
for one; Include, Retry auto-excluded and Reset all scan too), up to 10 sources at once;
opening the sheet never probes. Closing the sheet doesn't stop a scan. Android, iOS and
desktop probe; the web app in a browser doesn't.

Mirrors the plugin's `probes` map and its gist file `seanime-msu-probes.json`. Survives
sign-out and doesn't sync yet.
