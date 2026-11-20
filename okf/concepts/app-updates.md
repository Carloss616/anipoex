---
type: Concept
title: App updates
description: Which version the app runs, where newer ones come from, and when the Android app offers to install one.
resource: ../../src/features/updates/state/updates.ts
tags: [updates, releases, version]
generated: { by: claude-code, at: 2026-11-20T00:00:00Z }
---

**Version.** Each build carries a version `X.Y.Z`, taken from the GitHub release tag
`vX.Y.Z` it was built for. A build made without a release (a local or development build)
keeps the version in the app config.

**Where updates come from.** Releases are published by hand on the app's GitHub repo, and
CI attaches the built apps to each one. The newest **published, non-prerelease** release is
the one offered. Prereleases and drafts are never offered.

**When the Android app offers one.** Only the Android app installs its own updates. It
offers a release when:

- its version is newer than the running one, comparing major, minor and patch as numbers
  (`0.10.0` is newer than `0.9.9`);
- its APK is already attached: right after publishing, CI is still building it, and the
  release is skipped until the APK is there.

It looks by itself at most **once a day**, when the app opens or comes back, while the
device setting `updateCheck` is on (the default) and the app is online
([Settings](../stores/settings.md)). Development builds never look by themselves. The user
can always look from Settings → About.

An update shows its release notes and installs through Android's package installer, which
asks the user to confirm (and, the first time, to allow installs from the app).

On iOS and the desktop app, About shows the version and links to the release, without
offering to install.
