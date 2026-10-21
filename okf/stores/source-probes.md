---
type: Persisted Store
title: Source probes
description: What the last scan learned about each source for each manga.
resource: ../../src/features/manga/state/probes.ts
tags: [sources, probes, persistence]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-20T00:00:00Z }
---

Key `source-probes`: `{ [anilistId]: { [sourceId]: probe } }`, one [source probe](../concepts/source-probe.md)
per source, written as each one lands.

Probes are written when the user scans (the refresh button for every source, Rescan
for one; Include, Retry auto-excluded and Reset all scan too), up to 10 sources at once,
and whenever the chosen source is read outside a scan: picking it or a refresh records
what came back (its chapters, no match, or an error), the same probe a scan would write;
opening the sheet never probes. Rescans of different sources run together; a source's
Rescan is off only while that source is being probed, and Scan all only starts when no scan
runs. Closing the sheet doesn't stop a scan. Android, iOS and
desktop probe; the web app in a browser doesn't.

An error probe keeps what the source threw. A row with one, available or excluded, offers
**See error** in its menu (the ⋯ button, the iOS context menu or the Android long-press),
which shows the message with Rescan, or Include on an excluded row. Probes from before
the message was kept have none and offer nothing until the next read.

Mirrors the plugin's `probes` map and its gist file `seanime-msu-probes.json`. Survives
sign-out and doesn't sync yet.
