# Bundle Update Log

## 2026-10-18

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
