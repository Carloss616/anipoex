---
okf_version: "0.2"
---

# Anipoex — Knowledge Bundle

Domain knowledge for **Anipoex**, a manga tracker over the user's AniList list.
Start with the [product overview](overview.md); [README](README.md) explains the layout.

# Overview

* [Product overview](overview.md) - What the app does, the daily flow, and the vocabulary every other page assumes.

# Domain concepts

* [Concepts](concepts/) - Tracker and viewer, manga, list entry, statuses, tracking rules, score format, fuzzy dates, sources, source probes, source exclusions, extensions, chapters.

# AniList operations

* [Operations](operations/) - Every GraphQL query and mutation the app sends, what it asks for and who calls it.

# On-device state

* [Stores](stores/) - Session, Apollo cache, list view, theme, extension repos, chosen source, manual matches, source exclusions, pins, probes and chapters, extensions; where each lives and what clears it.

# Metrics

* [Metrics](metrics/) - Per-status list counts, the reading-progress caption, and the unread count per source.

# History

* [Update log](log.md)
