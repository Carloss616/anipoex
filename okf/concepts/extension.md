---
type: Domain Concept
title: Extension
description: A source as an installable package from a repo the user added; the Extensions tab installs, updates and uninstalls them. Android only.
tags: [extensions, sources]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

An **extension** is a [source](source.md) shipped as an APK by a repo the user added
(the app ships with none), plus:

| Field | Meaning |
|---|---|
| `language` | ISO 639 code and name; `mul` for multi-language sources. |
| `version` | The installed (or offered) build. |
| `latestVersion` | The repo's newest build, when it differs. |
| `repo` | The repo it came from; absent for an installed build no added repo lists. |
| `nsfw` | Adult content. |
| `installed` | Whether the app has it installed. |

**Has an update** ⇔ installed, and `latestVersion` is set and differs from `version`.

**Where it lives**: an installed extension is an APK kept in the app's private storage and
run inside the app, so it only works on Android. iOS and web list nothing installed and
refuse to install. Only extensions built against library 1.4 or 1.6 are offered. Each
repo signs its APKs; an install is accepted only if the APK carries the repo's signing
key, and an installed build is matched to the repo that signed it.

An installed extension that no added repo lists (offline, or the repo was removed) still
appears as installed, but can't be updated until a repo lists it again.

# The Extensions tab

- Filters: **All**, **Installed**, **Available** (not installed), **Updates**, from the
  `?filter=` param; plus `?language=`. Unknown values fall back to All / every
  language. Search matches the name.
- Installed extensions with a pending update are listed first.
- Install, Update, Update all, Uninstall; "Check for updates" and opening the tab reload
  the list from the repos.
- With no repo added and nothing installed, the tab says there are no repositories and points
  to Repositories.
- A repo that can't be reached is skipped with a toast; everything else still shows.
- **Repositories** (toolbar button): lists the added [repos](../stores/extension-repos.md)
  (empty until the user adds one). Adding one takes its URL, reads it, and asks the user to trust its
  signing key before it counts; an address that isn't a repo shows a toast and adds
  nothing. Removing one only stops listing its extensions: what is already installed
  stays installed. Both reload the list.
