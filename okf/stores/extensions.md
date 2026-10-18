---
type: In-memory Store
title: Extensions
description: The extension list with each one's installed flag and version; in memory, so installs reset on reload. Scaffolding.
resource: ../../src/features/extensions/state/extensions.ts
tags: [extensions, scaffolding]
status: draft
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Starts as the 12 mocked [extensions](../concepts/extension.md). Install, Uninstall and
Update patch one entry; Update all updates every one with a pending update. Nothing is
persisted: a reload or "Check for updates" puts the mock back.
