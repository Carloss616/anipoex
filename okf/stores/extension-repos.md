---
type: Persisted Store
title: Extension repos
description: The repos the user added to install extensions from; the app ships with none.
resource: ../../src/features/extensions/state/repos.ts
tags: [extensions, preferences, persistence]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-18T00:00:00Z }
---

Key `extension-repos`: the list of repos [extensions](../concepts/extension.md) come from.

| Field | Meaning |
|---|---|
| `baseUrl` | The folder that holds the repo's index, the repo's identity: a second repo with the same one is ignored. |
| `name` | The repo's own name, read when it was added. |
| `signingKey` | The key the repo's APKs must be signed with (lowercase); the user accepts it when adding the repo. |
| `indexUrl` | The file the repo was read from: a v2 store's index, or a legacy repo's `repo.json`. |
| `legacy` | Whether it is a legacy repo (`repo.json` + `index.min.json`) rather than a v2 store. |
| `extensionListUrl` | A v2 store's separate extension list, when it has one. |

- **Default**: empty. The app ships with no repo; the user adds each one by its URL.
- **Adding** a repo reads it first (an address that isn't a repo, or isn't `https`, is
  rejected: over plain http someone on the network could swap in their own key), then asks
  the user to trust its signing key: its extensions run inside the app.
- **Formats**: see [repository formats](../concepts/extension.md#repository-formats).
- A repo saved before `indexUrl` and `legacy` existed is read as a legacy repo whose
  `indexUrl` is `<baseUrl>/repo.json`; nothing is rewritten.
- **Removing** a repo only stops listing what it offers; an extension already installed
  from it stays installed.
- Signing out of AniList does not touch it: the repos belong to the device, not the account.
