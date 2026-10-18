---
type: Domain Concept
title: Score format
description: The viewer's AniList scoring scale; scores are read and saved in it, and the score can't be edited until it is known.
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
- The format comes from the [viewer](viewer.md). While it is null the tracking sheet's
  score cell is **disabled**: a score picked on a guessed scale would be saved on the
  wrong one (8 on 10 points lands as 8/100 for a 100-point user). The other fields still
  save; they send the score they read back unchanged, which is already on the right scale.
