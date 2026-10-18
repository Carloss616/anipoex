# Bundle Update Log

## 2026-10-18

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
