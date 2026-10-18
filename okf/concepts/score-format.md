---
type: Domain Concept
title: Score format
description: The viewer's AniList scoring scale; scores are read and saved in it, with a 10-point fallback until it is known.
tags: [tracking, score]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Each AniList user picks a `ScoreFormat`, and `MediaList.score` is stored and saved in
it (the 100-point `scoreRaw` exists but the app does not use it).

| Format | Range | Step | Shown as |
|---|---|---|---|
| `POINT_100` | 0–100 | 1 | integer |
| `POINT_10_DECIMAL` | 0–10 | 0.1 | one decimal |
| `POINT_10` | 0–10 | 1 | integer |
| `POINT_5` | 0–5 | 1 | integer (stars on AniList) |
| `POINT_3` | 0–3 | 1 | integer (smileys on AniList) |

- `0` means **unscored** and is shown as "—".
- The format comes from the [viewer](viewer.md). While it is null the slider runs on
  `POINT_10`, so a score saved then is read as 10-point; the viewer backfill is what
  keeps that window short.
