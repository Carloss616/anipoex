---
type: Domain Concept
title: Chapter
description: A chapter row on the manga detail screen. Scaffolding — eight mocked chapters, not tied to any source.
tags: [reading, scaffolding]
status: draft
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

A **chapter** row has an `id` (its number), a `title` and a release `date`. Today
the detail lists eight mocked chapters (374 down to 367) for every manga, whatever
[source](source.md) is picked. When the manga's `chapters` total is null, the mock's
length stands in for it on that screen.

Chapter numbers are what [list entry](list-entry.md) progress counts; nothing links a
row to progress yet.
