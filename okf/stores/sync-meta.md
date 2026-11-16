---
type: Persisted Store
title: Sync stamps
description: When each record of a synced store last changed, kept apart from the stores so sync can tell which copy is newer.
resource: ../../src/features/sync/state/sync-meta.ts
tags: [sync, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-15T00:00:00Z }
---

Key `sync-meta`: `{ [table]: { [recordKey]: { updatedAt, deletedAt? } } }`, times in epoch ms.

The synced stores and what one record of each is:

| Table | Store | A record |
|---|---|---|
| `settings` | [Settings](settings.md) | one section; `version` and `device` stay on the device |
| `matches` | [Chosen source](source-matches.md) | one manga |
| `manual-matches` | [Manual matches](manual-matches.md) | one manga on one source |
| `exclusions` | [Source exclusions](source-exclusions.md) | one manga on one source |
| `pins` | [Source pins](source-pins.md) | one manga on one source |
| `probes` | [Source probes](source-probes.md) | one manga on one source |
| `search-history` | [Search history](search-history.md) | the whole list |

A record's key is its path in the store, joined by `/` (`21/<sourceId>`). Every change the
app makes stamps the records it touched, from the first launch on, whether a sync is
connected or not; removing a record leaves a stamp with `deletedAt` (a tombstone) so the
removal can travel too. A record never stamped (data from before stamps) counts as time 0.
Loading a store from storage and a sync writing what it pulled stamp nothing.

When two copies of a record meet, the newer stamp wins; on a tie, the one already synced
beats this device's, so a device that joins adopts what is there and adds only what it alone
has. Tombstones older than 90 days are dropped when a table is written out.

Survives sign-out. The chapter lists, cookies, the session and extension DNS never sync.
