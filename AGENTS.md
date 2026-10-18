# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v58.0.0/ before writing any code.

# Project structure and conventions

Read [docs/app-structure.md](docs/app-structure.md) before adding, moving or splitting files: folder layout, platform files, hooks/utils placement and native screen rules.

@docs/app-structure.md

# Domain knowledge

`okf/` is the domain bundle in [Open Knowledge Format](okf/README.md) and the single owner of what things mean: the AniList operations, what the device stores, and the domain rules (list entry, statuses, tracking rules, score format, sources). Read it on demand, when the question is "what is X?" rather than "how do I code X?"; start at [okf/index.md](okf/index.md). When one of those changes, update its page and `okf/log.md` in the same change (`.claude/rules/okf.md` loads with those files).

Where guidance goes: what something *means* → `okf/`; how code is organized → `docs/app-structure.md`; needed only when editing certain files → a `.claude/rules/` file with `paths:`. Never two copies: the other side gets a one-line pointer.
