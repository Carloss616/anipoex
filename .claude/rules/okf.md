---
paths:
  - "src/**/*.gql"
  - "src/state/**"
  - "src/features/*/state/**"
  - "src/features/*/sources/**"
  - "src/features/*/utils/**"
  - "src/features/*/constants.ts"
  - "src/features/auth/trackers/**"
  - "src/graphql/client.ts"
  - "okf/**"
---

# Keep `okf/` true

`okf/` is the domain bundle ([Open Knowledge Format](../../okf/README.md) v0.2) and the single owner of what things mean: AniList operations, on-device stores, domain rules, derived figures.

- **When an operation (`.gql`), a persisted store, a domain rule or a derived figure changes, update its page in `okf/` and add an entry to `okf/log.md` in the same change.** A new one gets its own page plus a line in its folder's `index.md`.
- Every page opens with YAML frontmatter: `type` is required; add `title`, `description`, `tags`, `resource` (path to the code, relative to the page) and `generated: { by, at }`. Scaffolding pages carry `status: draft`.
- `index.md` and `log.md` are reserved: no frontmatter (except `okf_version` in the root `index.md`), `log.md` dated `## YYYY-MM-DD`, newest first.
- Links are relative markdown links between pages. Don't link into `docs/superpowers/` or `docs/design/`: they are gitignored.
- The bundle says what something means, not how it is coded: no helper names that a refactor would rename without looking here.
