# Bundle Update Log

## 2026-10-19

* **Every installed source shows, in any language**: the source picker and sheet no longer
  keep only `all`, `en` and the device language; an extension installed in another language
  is listed too. Updated [source](concepts/source.md).
* **Picking a source is immediate, finding the manga is separate**: the pick is stored before
  the search, so a source with no `manga` yet is a pending (or failed) search that resumes on
  open and retries on refresh. Updated [chosen source](stores/manga-source.md).
* **Repos are keyed by their index address**: two v2 stores in one folder are two repos, and
  removing one keeps the other. Updated [extension repos](stores/extension-repos.md).
* **Open a source's website**: each extension row opens its source's site, and the Android
  manga detail opens the matched manga's page on its source. Updated
  [extension](concepts/extension.md) and [source](concepts/source.md).
* **Repos resolve the way Mihon does**: a repo can be added by its folder, `repo.json`,
  `index.min.json` or `index.pb`; the format is told by the first byte, a `repo.json` with
  `index_v2` leads to the v2 store, v2 stores are read in JSON or protobuf (gzip or not)
  and may keep their list at a separate address. Saved repos gained `indexUrl`, `legacy`
  and `extensionListUrl`; older ones read as legacy. Unspecified content warnings count as
  safe. Updated [extension](concepts/extension.md) and
  [extension repos store](stores/extension-repos.md).
* **Logos fill their tile**: the installed APK's icon is cut to its opaque body (no
  launcher padding, shadow or mask) and the tile's colour shows only behind the initials,
  so no colour frames a loaded logo. Updated [source](concepts/source.md).
* **What extensions can run is stated honestly**: library 1.4/1.6 extensions work as far
  as what they commonly use; rate limiting, the JavaScript engine and source-side image
  fetching are not provided yet. A source's `id` is its own, not its extension's. Updated
  [extension](concepts/extension.md) and [source](concepts/source.md).
* **Empty source lists say why**: the source sheet tells iOS and web that sources run on
  Android only, and Android with nothing installed to install an extension from the
  Extensions tab; the detail's "Pick a source" says the same on iOS and web. A source whose
  extension was uninstalled reads as no choice. Repos must be added over `https`. Updated
  [source](concepts/source.md), [chosen source](stores/manga-source.md) and
  [extension repos store](stores/extension-repos.md).
* **Every installed extension has a name**: an older APK without a name in its metadata
  goes by its app label, else its package, instead of breaking the Extensions tab.
  Updated [extension](concepts/extension.md).
* **Source logo**: a source's tile shows its logo instead of the initials when it has
  one (the installed APK's icon, else the repo's), falling back to the initials while it
  loads or if it fails. Updated [source](concepts/source.md).
* **No repository of its own**: the app ships with no extension repo; the store starts
  empty and the user adds each one by URL. With no repo and nothing installed the
  Extensions tab says so. Updated [extension repos store](stores/extension-repos.md) and
  [extension](concepts/extension.md).

## 2026-10-18

* **Chapters come from the source**: the detail lists the chapters of the manga matched
  in the chosen source, no longer eight mocked ones; the number is the source's or, when
  it gives none, read from the name, and a row with no number is never dimmed as read.
  Rewrote [chapter](concepts/chapter.md).
* **Picking a source matches the manga in it**: the source is searched by the manga's
  romaji then English title and only an exact title (or synonym) match is kept; no match
  is remembered as such. Old bare source ids are ignored. Updated
  [chosen source](stores/manga-source.md).
* **Sources are the installed extensions' own**: the source picker and sheet list the
  sources of installed extensions in `all`, `en` and the device language, no longer a
  mocked list. Updated [source](concepts/source.md).
* **Extension repos can be added and removed**: the Extensions tab has a Repositories
  screen where the user adds a repo by URL (accepting its signing key) or removes one;
  removing a repo does not uninstall what came from it. New
  [extension repos store](stores/extension-repos.md); updated
  [extension](concepts/extension.md).
* **Extensions are real**: the Extensions tab lists what the added repos offer, merged
  with what is installed on the device, and Install / Update / Uninstall act on the
  device (Android only; iOS and web install nothing). An unreachable repo is skipped
  with a toast. Updated [extension](concepts/extension.md) and
  [extensions store](stores/extensions.md).
* **Failed saves don't stick on screen**: a tracking field whose save fails goes back to
  what AniList still has, and a failed removal leaves the sheet open. Updated
  [SaveMangaTracking](operations/save-manga-tracking.md) and
  [DeleteMangaTracking](operations/delete-manga-tracking.md).
* **No score before the format is known**: while the viewer has no score format, the
  tracking sheet's score cell is disabled instead of running on a 10-point guess that
  saves on the wrong scale. The window is not always short: a failed viewer fetch keeps
  it open for the whole session. Updated [score format](concepts/score-format.md) and
  [viewer](concepts/viewer.md).
* **Retry only where it works**: the error toast's **Retry** now re-runs a failed query
  even when nothing on screen watches it, and is no longer offered for a failed
  mutation, where it did nothing. Updated [operations](operations/index.md).
* **Verification**: [Tracking rules](concepts/tracking-rules.md) and
  [List entry](concepts/list-entry.md) reviewed by a human; now human-reviewed.
* **Partial dates survive a save**: the tracking sheet now sends a start or finish
  date only when the user changed or cleared it, so a partial AniList date it reads
  as unset is left alone. Updated [fuzzy date](concepts/fuzzy-date.md) and
  [SaveMangaTracking](operations/save-manga-tracking.md).
* **Initialization**: Created the bundle from the code as of this date: the
  [overview](overview.md), 11 [concepts](concepts/), the 6 AniList
  [operations](operations/), 6 on-device [stores](stores/) and 2 [metrics](metrics/).
* **Known lossy save**: saving the tracking sheet erases a partial AniList date (year
  only, or year and month), because the form reads it as unset and sends a null
  triple. Documented in [fuzzy date](concepts/fuzzy-date.md), not fixed.
