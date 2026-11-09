---
type: Persisted Store
title: Home layout
description: Which sections Home shows and in what order — one of three presets, or the user's own.
resource: ../../src/state/settings/
tags: [home, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-05T00:00:00Z }
---

Section `home` of [settings](settings.md).

| Field | Values | Default | Meaning |
|---|---|---|---|
| `preset` | `balanced`, `discover`, `personal`, `custom` | `balanced` | The preset whose sections Home shows, in its order; `custom` when a toggle or move leaves none matching, and a preset again once one does. |
| `order` | every section id, once | balanced's sections, then the rest | The order sections appear in, shown or not. |
| `on` | section ids | balanced's sections | The sections Home shows. |

Section ids: `continue`, `trending`, `because`, `genres`, `following`, `releasing`,
`new`, `top`, `manhwa`, `planning`, `global`.

| Preset | Sections shown, in order |
|---|---|
| `balanced` | continue, trending, because, genres, following, releasing, new |
| `discover` | trending, releasing, genres, new, top, manhwa, global |
| `personal` | continue, because, planning, following, trending |

Picking a preset puts its sections first, in its order, and hides the rest, which follow
in the list order above. Home shows `order` minus what is off, and asks
[HomeSections](../operations/home-sections.md) for exactly those sections.

A layout saved by another build is read leniently: unknown ids are dropped, missing ones
come back hidden at the end, and anything unreadable reads as `balanced`.

The user edits it in Settings → Home layout (`/settings/layout`), also reached from
"Customize home" at the end of Home: a preset, a switch per section, and its place in the
list (dragged on iOS and web, moved from a row's long-press menu on Android).
