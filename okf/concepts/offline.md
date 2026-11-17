---
type: Concept
title: Offline
description: When the app counts as offline, what that changes, and what waits until it is back.
resource: ../../src/state/network/network.ts
tags: [offline, network]
generated: { by: claude-code, at: 2026-11-16T00:00:00Z }
---

The app is **online** only when the device reports a connection **and** AniList answered the
last time it was asked. Either failing makes it offline.

# What counts

- **The system**: no network is offline at once. When it comes back the app checks that
  AniList answers before it says online. A network the device reports as having no internet
  is not trusted on its own (the device's check can be blocked while AniList works): the app
  asks AniList, and its answer decides.
- **AniList**: a request to AniList that gets no answer at all (no server, not an error from
  one) marks the app offline. Any answer, even an error, marks it online again. While it
  can't be reached, it is asked again every 30 seconds and when the app returns to the
  foreground.
- **What doesn't count**: a source, a chapter page or the GitHub sync that fails. Any of them
  can be down or blocked while AniList answers, and the app stays online.

# What it changes

- **Edits are kept**: changes to the list are saved on the device and shown at once, then
  sent when online. See [Pending entries](../stores/pending-progress.md).
- **No error toasts for lost connections**: a query that fails for want of a connection
  waits quietly, and so does a change that is kept for later. A change that can't be kept
  still says it failed.
- **Scans don't start, and running ones stop**: a scan can't tell a dropped connection from
  a failing source, so it would exclude good sources.
- **Downloads pause** and start again by themselves when the connection returns, apart from
  the user's own pause. See [Downloads](../stores/downloads.md).

# What the user is told

- A notice, once the connection has stayed changed for 3 seconds: "You're offline · Changes
  stay on this device" and, on return, "Back online" (with the number of changes being sent
  when there are some). A connection that flaps in less than that says nothing, and an
  offline already announced is not repeated. The notice's "View" opens Settings › Pending.
- **Settings › Pending** lists what waits: changes to the list, sync, and downloads, with
  Retry and Discard for what AniList turned down. The Settings tab shows the count as a
  badge.

# When it returns

Pending changes are sent (see [Pending entries](../stores/pending-progress.md)), the sync
runs and downloads resume. Several returns in a row share one run.
