---
type: Derived Metric
title: Unread chapters
description: The +N a source shows, how many whole chapters it has beyond the user's progress.
resource: ../../src/features/manga/utils/source-classify.ts
tags: [metrics, sources]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-20T00:00:00Z }
---

The `+N` a [source](../concepts/source.md) shows is `max(0, floor(latest − read))`, where
`read` is the [list entry](../concepts/list-entry.md)'s progress (null counts as 0) and
`latest` is the source's [probe](../concepts/source-probe.md).

| Read | Latest | Shown |
|---|---|---|
| 363 | 374.5 | +11 |
| 18 | 18.5 | +0 |
| 20 | 18 | +0 (behind is never negative) |

It floors because a `.5` release isn't a whole unread chapter. This is the plugin's
rule, so both apps show the same number.

## What a source row shows

The status, then `· c.{latest}` (`c.{latest}?` when the numbering is suspicious), then
`· {age}`.

| Status | Meaning |
|---|---|
| not scanned | No probe yet. |
| scanning | A scan is reading it now. |
| error | The last probe failed. |
| no match | The source has no title equal to the manga's. |
| +N | The unread count; amber when suspicious or outdated, green when above 0, grey otherwise. |

## Suspicious numbering

A matched source whose latest chapter is more than 20 chapters above the median latest of
at least two other matched, non-excluded sources is flagged. It is an anipoex addition, not
in the plugin. It is computed over all available sources regardless of the search, and it
is only a hint: it never excludes a source by itself.

## Age

How long ago the probe ran: `now` (under a minute), `{m}m` (under an hour), `{h}h` (under a
day), else `{d}d`, floored.
