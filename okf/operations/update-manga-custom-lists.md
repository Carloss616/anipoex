---
type: GraphQL Mutation
title: UpdateMangaCustomLists
description: Replace the names of the viewer's manga custom lists — how a list is made, renamed or deleted.
resource: ../../src/features/manga/graphql/manga-list.gql
tags: [manga, list, custom-list, mutation]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-16T00:00:00Z }
---

Wraps AniList's `UpdateUser(mangaListOptions: { customLists })`, which replaces the
whole array of names.

- **Make**: the current names plus the new one, last, so no entry's lists move.
- **Rename**: the same names with the new one in its place; the entries keep their
  lists, and the app renames the flag in each cached entry.
- Every change first reads [MangaListCounts](manga-list-counts.md) fresh and sends the
  names as AniList has them then, repeats included: cached names would bring back a list
  deleted on another device. After it, the counts are read again without a toast;
  offline, the change fails before that and nothing moves.
- **Delete**: the names without it. AniList keeps membership by position (see
  [custom list](../concepts/custom-list.md)), so after sending the names the app saves each entry
  in the deleted list or a later one again with
  [SaveMangaTracking](save-manga-tracking.md) (`customLists` only), one at a time; a
  failed one doesn't stop the rest.
- Returns the user with the new names, which Apollo merges into the cached counts'
  user; deleting also drops the list's cached groups.
- Error toasts: "Couldn't create the list", "Couldn't rename the list", "Couldn't
  delete the list", and "Couldn't keep every manga in its lists" when a save after a
  delete fails.
