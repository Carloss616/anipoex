---
type: Persisted Store
title: Extension installs
description: The extensions this user keeps, so every device installs and removes the same ones.
resource: ../../src/features/extensions/state/installs.ts
tags: [extensions, sync, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-16T00:00:00Z }
---

Key `extension-installs`: `{ [pkg]: { name, signingKey } }`, one entry per extension the
user keeps. `signingKey` is the key its build is signed with, so a device installs it from
the same repo when two list the package (a fork); a device without a repo signed with that
key counts the install as failed rather than take another build.

Installing an extension in the app adds it and uninstalling removes it; updating doesn't
change it. It [syncs](sync-meta.md) as the `extensions` table, so the list is the same on
every device, and after each sync a device brings its installs in line: it installs, at the
repo's newest version, what another device added, and uninstalls what one removed, each with
one notice ("Installed 2 extensions from your other devices"). An install that fails is not
tried again until the app restarts.

On the first sync with it, a device adds what it already has installed without a time, so
the lists of all devices join, and a removal made elsewhere still wins over it. An entry
written before keys were kept takes the key of the build this device has. A plain
browser can't run extensions: it carries the list but installs nothing.
