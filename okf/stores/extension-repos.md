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
| `signingKey` | The key the repo's APKs must be signed with; the user accepts it when adding the repo. |

- **Default**: empty. The app ships with no repo; the user adds each one by its URL.
- **Adding** a repo reads it first (an address that isn't a repo is rejected), then asks
  the user to trust its signing key: its extensions run inside the app.
- **Removing** a repo only stops listing what it offers; an extension already installed
  from it stays installed.
- Signing out of AniList does not touch it: the repos belong to the device, not the account.
