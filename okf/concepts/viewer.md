---
type: Domain Concept
title: Viewer
description: The signed-in AniList user as the app keeps it — id, name, avatar and score format — fetched by the Viewer query.
tags: [auth, anilist, user]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

The **viewer** is the signed-in user, normalized to the app's `User`:

| Field | Meaning |
|---|---|
| `id` | AniList user id. Every list query is scoped to it (`userId`). |
| `name` | Display name ("Hi, <name>" on Home). |
| `avatarUrl` | `avatar.large`, or null. |
| `scoreFormat` | The user's [score format](score-format.md). **Null until fetched.** |

Loaded by the [Viewer](../operations/viewer.md) query right after sign-in and persisted
in the [session](../stores/session.md), so later launches have it without a request.

# Backfill

A viewer persisted before `scoreFormat` existed has it null. On launch, if there is a
token and no `scoreFormat`, the viewer is fetched again in the background. Until it
lands, the score field runs on the 10-point fallback, which could overwrite a score
stored on another scale; that is why the backfill exists. A failed backfill keeps the
fallback silently.
