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
opening the sheet never probes. Rescans of different sources run together; while a source is being probed it shows
*scanning…* and offers Stop (beside its spinner, or in place of Rescan or Include in the iOS menus). An excluded row being
probed shows that in place of Include, which waits only for that source's own probe. Scan all only starts when
no scan runs. Each source is judged as its probe lands, not when the whole scan ends. Stop drops that source from the scan, which goes on without it: its last probe
stays and its exclusion doesn't change; the source's own call still runs out in the
background. Closing the sheet doesn't stop a scan. Android, iOS and
desktop probe; the web app in a browser doesn't.

A Reading scan (the Reading list's header) runs each Reading manga's own Scan all, never-probed
and then the stalest first. The next manga starts once the one before is down to its last 2 sources, so at most two run
at once, and a source is read for one manga at a time. Unless the user picks "Rescan everything", it skips sources probed within the last 60 minutes
and sources that found no match within the last 7 days. It ends with one summary toast: where a Stop came, how many manga
have new chapters, how many sources it picked and how many manga it skipped as checked recently (zeros left out), with
*Undo picks*, which restores only the picks that are still the scan's own. A manga counts as having new chapters when any source it can be read from is ahead
of the user's progress, picked or not.

An error probe keeps what the source threw. A row with one, available or excluded, offers
**See error** in its menu (the ⋯ button, the iOS context menu or the Android long-press),
which shows the message with Rescan, or Include on an excluded row. Probes from before
the message was kept have none and offer nothing until the next read.

Mirrors the plugin's `probes` map and its gist file `seanime-msu-probes.json`. Survives
sign-out and doesn't sync yet.
