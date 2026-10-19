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
| `websiteUrl` | The first source's website: the installed build's own, else the one its repo lists; none when neither has one. |
| `installed` | Whether the app has it installed. |

An installed build is named by its own metadata; an older build without one goes by its
app label (minus the `Tachiyomi: ` prefix), else by its package name, so it always lists.

**Has an update** ⇔ installed, and `latestVersion` is set and differs from `version`.

**Where it lives**: an installed extension is an APK kept in the app's private storage and
run inside the app, so it only works on Android. iOS and web list nothing installed and
refuse to install. Only extensions built against library 1.4 or 1.6 are offered. The app
provides what those extensions commonly use, not all of it yet: rate limiting, the
JavaScript engine some sites need, and a source fetching its own images are missing, so
an extension that relies on one of them fails when it reaches that step. Each
repo signs its APKs; an install is accepted only if the APK carries the repo's signing
key, and an installed build is matched to the repo that signed it.

An installed extension that no added repo lists (offline, or the repo was removed) still
appears as installed, but can't be updated until a repo lists it again.

# The Extensions tab

- Filters: **All**, **Installed**, **Available** (not installed), **Updates**, from the
  `?filter=` param; plus `?language=`. Unknown values fall back to All / every
  language. Search matches the name.
- Installed extensions with a pending update are listed first.
- Each row with a `websiteUrl` has an "Open website" button that opens the source's site; without one, no button.
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

# Repository formats

A repo is read the way Mihon reads it, so any address Mihon accepts works here:

- **Which address**: a folder means its `repo.json`; an address ending in a file
  (`repo.json`, `index.min.json`, `index.pb`, …) is read as given. Only `https`.
- **What it is** is told by the first byte of what comes back, not by the file name:
  - `[`: a v1 list. Only accepted at an `index.min.json` address; the repo's name and key
    come from the `repo.json` next to it.
  - `{`: a legacy `repo.json` (name and signing key under `meta`) or a v2 store in JSON.
  - anything else: a v2 store in protobuf.
- A legacy `repo.json` that names a v2 index (`index_v2`) is followed, and the v2 store
  is what gets added.
- A **v2 store** carries its name, signing key and either its extension list or the address
  of that list (JSON or protobuf, again by first byte). A **legacy** repo lists its
  extensions in `index.min.json`, with each APK under `apk/` and its icon under `icon/`.
- Something without a name or a signing key isn't a repository.
- A gzip-compressed index (most published `index.pb` files are) is unzipped first.
- Content warning: mixed and adult extensions count as `nsfw`; safe or unspecified don't.
- A source's website is its `homeUrl` in a v2 store and its `baseUrl` in a legacy list.
- A source's id is a 64-bit number, kept exact as text.
