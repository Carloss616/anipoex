# Bundle Update Log

## 2026-10-18

* **Initialization**: Created the bundle from the code as of this date: the
  [overview](overview.md), 11 [concepts](concepts/), the 6 AniList
  [operations](operations/), 6 on-device [stores](stores/) and 2 [metrics](metrics/).
* **Known lossy save**: saving the tracking sheet erases a partial AniList date (year
  only, or year and month), because the form reads it as unset and sends a null
  triple. Documented in [fuzzy date](concepts/fuzzy-date.md), not fixed.
