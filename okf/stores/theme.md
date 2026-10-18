---
type: Persisted Store
title: Theme
description: The theme family and the light / dark / system preference.
resource: ../../src/state/theme/
tags: [theme, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Key `theme`.

| Field | Values | Default |
|---|---|---|
| `family` | `default`, `moon`, `grass` | `default` |
| `preference` | `system`, `light`, `dark` | `system` |

`mode` (the painted light or dark) is computed, not stored: `system` follows the OS
and re-reads it when it flips.
