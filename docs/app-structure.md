# App Structure Convention

Expo Router (v57) app. Routes live in `src/app/`, everything else in `src/`. Import alias is `@/*` → `src/*` (and `@/assets/*` → `assets/*`), configured in [tsconfig.json](../tsconfig.json).

## Directory layout

```
anipoex/
├── src/
│   ├── app/                         # Expo Router file-based routes (thin wrappers)
│   ├── features/                    # group screens by feature (all folders kebab-case)
│   │   └── <feature>/               # global folders below + screens/
│   │       ├── providers/
│   │       ├── hooks/
│   │       ├── utils/
│   │       ├── ...
│   │       └── screens/
│   │           ├── <screen>/
│   │           │   ├── components/  # only used in this screen
│   │           │   ├── hooks/       # only used in this screen
│   │           │   ├── <screen>.tsx
│   │           │   └── index.tsx    # export * from './<screen>'
│   │           └── home.tsx         # simple screen — single file, no folder
│   │
│   ├── components/                  # global — reused across features
│   │   ├── <component>/             # complex component with internal parts
│   │   │   ├── components/          # only used by this component
│   │   │   ├── <component>.tsx
│   │   │   └── index.tsx            # export * from './<component>'
│   │   ├── button.tsx               # simple component — single file, no folder
│   │   └── ...
│   ├── hooks/                       # global hooks
│   ├── providers/                   # global providers
│   ├── constants/                   # global constants (theme, config)
│   └── utils/                       # global helpers
└── assets/                          # images, fonts, icons (@/assets/*)
```

Global resources (`components/`, `hooks/`, `providers/`, `constants/`, `utils/`) sit at the **root of `src/`**, as siblings of `features/` — there is no `shared/` wrapper. Anything reused by two or more features lives here; anything tied to one feature lives under `src/features/<feature>/`.

## Screen pattern

Each screen is a **single file** (`<screen>.tsx`) that owns its data-fetching, state, and UI. No container/presentational split — extract logic into **hooks** in the screen's `hooks/` folder, or keep it in the screen file.

Styles go in the screen file unless large enough to warrant `<screen>.styles.ts`.

```
anime/
└── screens/
    └── anime-detail/
        ├── anime-detail.tsx         # screen (data + UI in one file)
        ├── hooks/                   # extracted logic if the screen is complex
        │   └── use-anime.ts
        ├── components/              # private sub-components
        │   └── episode-list.tsx
        └── index.tsx                # export * from './anime-detail'
```

## Route files (`src/app/`)

Route files are **thin wrappers** — they import the screen from `src/features/` and handle only route-level concerns (`Stack.Screen` options: title, presentation). All business logic lives in the feature screen.

```tsx
// src/app/(app)/anime/[id].tsx
import { Stack } from 'expo-router'
import { AnimeDetail } from '@/features/anime/screens/anime-detail'

export default function AnimeDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Anime' }} />
      <AnimeDetail />
    </>
  )
}
```

- Function name is `PascalCase` + `Screen` suffix (`AnimeDetailScreen`, `HomeScreen`).
- `Stack.Screen` options belong here, not in the feature screen.

## Rules

### Naming

- **kebab-case** for every folder and file inside `src/` (files, hooks, components alike).
- Route files follow Expo Router conventions (`_layout.tsx`, `[id].tsx`, `(group)/`).
- Platform-specific files use a suffix before the extension: `app-tabs.tsx`, `app-tabs.web.tsx`.

### Barrel exports (`index.tsx`)

- Every folder-based component/screen **must** have an `index.tsx` re-exporting the main file.
- Re-export the file **without** a platform suffix: `export * from './app-tabs'` (Metro/webpack resolve `app-tabs.web.tsx` automatically).

### Scope of internal folders

- `components/`, `hooks/` nested inside a screen or component folder are **private** to it.
- Anything reused across screens or features belongs in the global folders at the root of `src/`.

### Feature vs global

| Location                      | When to use                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/features/<feature>/`     | Code tied to a specific feature (screens, feature-level providers, hooks, utils)                |
| `src/{components,hooks,...}/`  | Code used by two or more features, or truly generic (design-system components, global hooks)    |

### Platform-specific files

When a component needs separate web/native implementations, wrap it in its own folder. The **default file** (`<component>.tsx`) is the native implementation and exports the shared props type; platform files import those props.

```
chart/
├── chart.tsx           # default (native) — exports ChartProps type
├── chart.web.tsx       # web override — imports ChartProps from './chart'
└── index.tsx           # export * from './chart'
```

For simple cases (no shared props), a flat layout is fine:

```
app-tabs.tsx            # default / web
app-tabs.web.tsx        # web override
```

Metro and webpack resolve the correct file at build time. `index.tsx` always points to the unsuffixed file.
