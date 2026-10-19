---
type: In-memory Store
title: Extensions
description: The extension list, rebuilt from the added repos and what is installed on the device; not persisted itself.
resource: ../../src/features/extensions/state/extensions.ts
tags: [extensions]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-18T00:00:00Z }
---

Starts empty. Opening the Extensions tab (or "Check for updates") rebuilds the list of
[extensions](../concepts/extension.md): each added repo's index, merged with what is
installed on the device. Install, Update, Update all and Uninstall change the device, then
rebuild the list. Nothing in the list is persisted: the device itself is the record of
what is installed, and the repos the user added are the only thing kept between launches.

An extension has at most one install or removal running at a time; a second tap on the
same one is ignored. A failure is shown as a toast, never thrown at the button.
