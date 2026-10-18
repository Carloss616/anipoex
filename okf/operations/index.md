# AniList operations

Every GraphQL operation the app sends to AniList, one page each. Documents live in
`src/**/*.gql` and are typed by codegen against AniList's live schema. Shared rules for
all of them:

- Sent with the session token as `Authorization: Bearer`.
- One retry, then a toast with the operation's own message, unless the call is marked
  `silent`. A failed query's toast offers **Retry**, which runs the same query again; a
  failed mutation's does not: the user redoes the change instead.
- Results land in the [Apollo cache](../stores/apollo-cache.md), which is persisted.

# Queries

* [Viewer](viewer.md) - The signed-in user and their score format.
* [MangaList](manga-list.md) - One list status of the viewer's manga, as cards.
* [MangaListCounts](manga-list-counts.md) - Entry ids per list, to count each status.
* [MangaDetail](manga-detail.md) - One manga with its detail fields and full list entry.

# Mutations

* [SaveMangaTracking](save-manga-tracking.md) - Create or edit the viewer's list entry for a manga.
* [DeleteMangaTracking](delete-manga-tracking.md) - Remove a list entry.
