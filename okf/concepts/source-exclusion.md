---
type: Domain Concept
title: Source exclusion
description: Dropping a source for one manga, why it was dropped, and how a scan excludes bad sources by itself.
resource: ../../src/features/manga/utils/source-exclusions.ts
tags: [sources, exclusions]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

**Excluding** a [source](source.md) drops it for that one manga: it is not scanned, and it
is listed apart with its reason. Each exclusion is a record of the
[manga-source-updates plugin](https://github.com/Carloss616/seanime-extensions/tree/main/src/plugins/manga-source-updates),
whose rules and shapes these are, which is what keeps its gist files compatible.

## Reasons

| Menu label | Badge | Set by |
| --- | --- | --- |
| Behind / outdated | behind | auto or you |
| Wrong chapter numbers | bad numbers | you |
| No match | no match | auto or you |
| Fetch error | error | auto or you |
| Other | manual | you |

## Exclude, include and pins

**Exclude** records the reason. **Include** keeps the record but marks it deleted (so the
removal can sync), then rescans that source. Either one **pins** the source, and a pinned
source is never auto-excluded. So *auto* versus *manual* is exactly whether a live pin
exists, and the list says which (`· auto` / `· you`).

Excluding the source chosen for the manga also unchooses it, so the detail asks to pick a
source again; its row can also just be **deselected**, which only clears the choice.

Picking a source by hand that finds no match never excludes it: the detail says *No match*
and offers **Choose another source**, which opens the source list. Only a scan excludes by
itself.

## Retry and reset

**Retry auto-excluded** marks only unpinned exclusions deleted, then rescans. **Reset
all** asks first, then marks every live exclusion and pin of the manga deleted and
rescans, so bad sources come back auto-excluded.

## Auto-exclusion

After a scan, the bad outcomes from [source probe](source-probe.md) are excluded by
themselves, judged against the list entry's progress when the scan ends (reading on
meanwhile counts). Each is dated by the probe that caused it. It never removes a manual
choice and never touches a pinned source. The source chosen for the manga when the scan
ends (one picked mid-scan too) is spared an error or a lag, which may pass while it is
being read, but not a no match: it has nothing to read, so it is excluded and unchosen.
Recovered auto-exclusions are dropped only by the 7-day recheck below.

## Where anipoex differs from MSU

The records are the same, so sync still works both ways.

* A fetch error only auto-excludes on its second consecutive scan.
* An auto-exclusion older than 7 days is probed again on *Scan all*, and dropped if the
  source recovered or re-dated if not. Manual ones never expire.
