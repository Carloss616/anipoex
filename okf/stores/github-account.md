---
type: Persisted Store
title: GitHub account
description: The GitHub connection sync uses: the token, who it belongs to and the sync gist.
resource: ../../src/features/sync/state/github/
tags: [sync, github, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-15T00:00:00Z }
---

- **Token**: on iOS and Android in the Keychain / Keystore (SecureStore key
  `github_access_token`); in a browser and on desktop under `github-token`. It only has
  the `gist` scope.
- Key `github-account`: `{ login, avatarUrl, gistId? }`, the GitHub user and the gist
  syncing uses.

Connecting, from Settings → Sync (under Account): the apps (iOS, Android, desktop) use GitHub's code sign-in, where the user
types a code on github.com and the app connects by itself once authorized; desktop asks for
the code through its main process, since github.com's sign-in endpoints can't be called from
a page. A browser can't use it, so on the web the user pastes a token with the `gist` scope.
Either way it is kept only once it has found or made the sync gist, which proves it has the
`gist` scope; a dropped request while waiting for the code just waits for the next poll.

The gist is private, described "Anipoex sync", and marked by its `anipoex-manifest.json`:
a device finds it among the user's gists, or makes it when there is none, and keeps its id.
A deleted gist is found or made again on the next sync. A sync downloads only what changed
since the last one in this session: GitHub answers "not modified" when the gist is the same,
and a file whose content is unchanged keeps its download address, so it isn't fetched again. Each device writes its own files
there, `anipoex-<table>.<device>.json` ([sync stamps](sync-meta.md)).

The Sync section shows the GitHub user with the last sync ("Synced 5m ago", "Syncing…", or
why it failed; no connection isn't shown as a failure), the devices whose files are in the
gist (this one first, the others with when they last changed something), each with an icon
for what it is: phone, tablet, computer or browser, which its files say; a device on an
older build gets a generic one. Its menu (long press on Android, context menu on iOS, ⋯ on the web) has Sync
now, Open gist on GitHub and Disconnect; a revoked token shows Reconnect instead. The first
sync after connecting ends with one notice: how many devices it merged with and how many
records it changed here.

Disconnecting, after a confirmation, syncs one last time, then forgets the token and the
account here and stops syncing. This device's files leave the gist when every record in them
is already, as new or newer, in another device's file, or when no other device is there:
nothing is lost (the data stays on this device), and the other devices stop listing it. Otherwise (another device hasn't synced its last changes yet) they stay, and
the notice says so. The gist itself and the other devices' files stay on GitHub; reconnecting
finds the gist again and writes this device's files back.