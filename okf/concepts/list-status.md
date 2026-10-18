---
type: Domain Concept
title: List status
description: The six places a manga can be filed on the user's list, the label each shows, and how the Manga tab picks one.
tags: [tracking, list, status]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

AniList's `MediaListStatus`, with the label the app shows:

| Value | Label | Meaning |
|---|---|---|
| `CURRENT` | Reading | Being read. The default list. |
| `PLANNING` | Planning | Meant to be read. |
| `COMPLETED` | Completed | Finished. |
| `PAUSED` | Paused | On hold. |
| `DROPPED` | Dropped | Abandoned. |
| `REPEATING` | Rereading | Being read again. |

# How the Manga tab uses it

- One status at a time, from the `?list=` route param. Anything that is not one of the
  six values (a typo, a stale deep link) opens **Reading**.
- **Custom lists are ignored for counting**: on AniList they hold entries already filed
  under a status, so counting them would count twice (see [list counts](../metrics/list-counts.md)).
- **Completed is one list**: the queries pass `forceSingleCompletedList`, overriding a
  user who split Completed by format on AniList.

Which statuses the [tracking rules](tracking-rules.md) may move an entry into on their
own: only Reading and Completed.
