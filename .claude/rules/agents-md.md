# Keep `AGENTS.md` lean and current

When a task teaches something later work in this repo must follow, write it down in the same change: a convention the user set or corrected, a pattern that fixed a measured problem, a gotcha that cost real time.

Only if all of these hold:

- **It reaches past this task**: it applies to more than the files touched now, and the code alone doesn't show it.
- **It isn't there yet**: check `AGENTS.md`, `docs/app-structure.md`, `okf/` and `.claude/rules/`. Sharpen the existing line instead of adding a near-copy.
- **It's confirmed**: measured, or stated by the user. Not a guess.

How:

- One bullet per idea, a line or two: the rule, its why, and a path to an example. No tutorials, no history of what was done.
- Put it where `AGENTS.md` says it belongs: what something means → `okf/`; folders and files → `docs/app-structure.md`; needed only when editing certain files → a `.claude/rules/` file with `paths:`; repo-wide coding patterns → `AGENTS.md`.
- Fix or delete a line that turned out wrong or obsolete. Replace before you append.
- Skip one-off fixes, task history, anything a linter or the type checker already enforces, and library docs (link them instead). The user's personal preferences go to memory, not to these committed files.

Say in the final reply what was added or changed, so the user can veto it.
