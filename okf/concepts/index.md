# Concepts

Domain ideas and rules. Read these before the [operations](../operations/) and
[stores](../stores/): their field names assume this vocabulary.

# Identity

* [Tracker](tracker.md) - The service that holds the list (only AniList) and how the app signs in to it.
* [Viewer](viewer.md) - The signed-in AniList user as the app keeps it: id, name, avatar, score format.

# The list

* [Manga](manga.md) - An AniList media of type MANGA: titles, cover, genres, publication status, chapter total.
* [List entry](list-entry.md) - The user's row for one manga: status, progress, score, dates; created on first save.
* [List status](list-status.md) - The six places a manga can be filed, their labels, and the `?list=` param.
* [Tracking rules](tracking-rules.md) - The side effects a status or progress change applies, shown before saving.
* [Score format](score-format.md) - The viewer's scoring scale; scores are read and saved in it.
* [Fuzzy date](fuzzy-date.md) - AniList's year/month/day dates, how the form reads them, and why a save leaves a partial one alone.

# Reading (scaffolding)

* [Source](source.md) - A site chapters come from, from an installed extension in any language; each manga remembers one.
* [Extension](extension.md) - A source as an installable, versioned package from an added repo. Android only.
* [Chapter](chapter.md) - A chapter row on the detail screen, read from the matched manga in the chosen source.
