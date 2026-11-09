---
type: Persisted Store
title: Chosen source
description: The source picked for each manga, keyed by AniList id.
resource: ../../src/features/manga/state/source.ts
tags: [sources, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

Key `source-matches`: `{ [anilistId]: { sourceId, manga?, auto? } }`. The pick is stored the moment
the user makes it, so the detail names the source at once; `manga` is added when the search
ends. A `sourceId` without `manga` is a search still pending: it resumes when the detail
opens and retries on refresh, and a failed search leaves it that way. `manga` is the title the
[source](../concepts/source.md) answered with (its `url`, `title` and the source's own data for it, `memo`, which some sources need to list its chapters) when it equals a
known title once case, diacritics, punctuation, spaces and romaji long vowels are ignored
(`Ren'ai Zunōsen` equals `Renai Zunousen`); failing that, when it equals one after dropping
an edition tag, one of only `official`, `colored` or `remake` words (`(Official Colored)`). Any
other tag stays: `One-punch Man (ONE)` is the webcomic, and a tag that is the title itself
marks fan comics (`odio amarte (one punch man)`). The known titles are the AniList titles and
synonyms; what follows a title's first colon when it has two words or more (`Mookhyang: Dark
Lady` → `Dark Lady`; `Solo Leveling: Ragnarok` gives nothing, `Ragnarok` alone is another
work); and the titles of the manga's [manual matches](manual-matches.md) on other sources,
which name it the way sources do (`Soldado Esqueleto`, `Antiguo Supremo`). `manga: null` means
the source was searched and nothing matched, never an approximate result: a similarity score
would take `Monsters` for `Monster`, a sequel (`Solo Leveling: Ragnarok`) or a doujinshi, and
list the wrong manga's chapters. The search reads the first page of up to five queries, in
order, until one matches: the romaji title, the English one, the after-colon parts, the
manual matches' titles in Latin script, then synonyms in Latin script, each once. A page the user set by hand ([manual match](manual-matches.md))
comes first and isn't searched; then a source whose
[chapters are stored](source-chapters.md) for the manga isn't searched again, its stored page is the match. Values from before matching
(a bare source id) are ignored, so the user picks the source again. A scan (*Scan all* or one
source's rescan) picks the best source when none is chosen, or when the one chosen was picked by
a scan: matched, not excluded, not failing, numbering not suspicious, then in the
[source order](../concepts/source.md); so a manga scanned for the first time shows its `+N` in
the list. Such a pick carries `auto: true`, kept while its search resumes; a pick the user makes
has none, and a scan never replaces it. It says "Picked <source> · +N" (no `+N` when nothing is new) with an Undo that puts
back what was there before (no source, or the previous scan's pick), as long as the scan's pick
is still the one chosen. The user can turn it off
in Settings ("Auto-pick a source", [settings](settings.md) `sources.autoPick`, on by
default). A missing key means no source chosen; so does a match whose source no installed extension provides any more
(it was uninstalled), once the installed list has been read, so the detail asks to pick
a source again instead of failing to load chapters. Deselecting the source, or
[excluding](../concepts/source-exclusion.md) it by hand or by a scan, removes the key. Survives sign-out (it is not cleared) and does not sync anywhere.
