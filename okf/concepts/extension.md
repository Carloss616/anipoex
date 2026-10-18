---
type: Domain Concept
title: Extension
description: A source as an installable package with a language and a version; the Extensions tab installs, updates and uninstalls them. Scaffolding.
tags: [extensions, sources, scaffolding]
status: draft
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

An **extension** is a [source](source.md) as the registry lists it, plus:

| Field | Meaning |
|---|---|
| `language` | ISO 639 code and name; `mul` for multi-language sources. |
| `version` | The installed (or offered) build. |
| `latestVersion` | The registry's newest build, when it differs. |
| `nsfw` | Adult content. |
| `installed` | Whether the user has it. |

**Has an update** ⇔ installed, and `latestVersion` is set and differs from `version`.

# The Extensions tab

- Filters: **All**, **Installed**, **Available** (not installed), **Updates**, from the
  `?filter=` param; plus `?language=`. Unknown values fall back to All / every
  language. Search matches the name.
- Installed extensions with a pending update are listed first.
- Install, Update, Update all, Uninstall.

**Scaffolding**: 12 mocked extensions with invented languages and versions; installs
live in memory and reset on reload (see [extensions store](../stores/extensions.md)).
"Check for updates" resets to the mock after a fake delay.
