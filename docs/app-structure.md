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
│   │           │   ├── constants.ts # only used in this screen
│   │           │   ├── <screen>.tsx
│   │           │   └── index.ts     # export * from './<screen>'
│   │           └── home.tsx         # simple screen — single file, no folder
│   │
│   ├── components/                  # global — reused across features
│   │   ├── ui/                      # design system (button, icon, typography…)
│   │   ├── layout/                  # structure (row, column, header, tabs…)
│   │   ├── <component>/             # complex or multi-platform component
│   │   │   ├── components/          # only used by this component
│   │   │   ├── <component>.tsx
│   │   │   └── index.ts             # export * from './<component>'
│   │   ├── empty-state.tsx          # simple component — single file, no folder
│   │   └── ...
│   ├── hooks/                       # global hooks
│   ├── providers/                   # global providers
│   └── utils/                       # global helpers
└── assets/                          # images, fonts, icons (@/assets/*)
```

Constants live next to what uses them (`constants.ts` inside the screen or component folder), not in a global `constants/`.

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
        └── index.ts                 # export * from './anime-detail'
```

## Route files (`src/app/`)

Route files are **thin wrappers** — they only import the screen from `src/features/` and render it. All logic lives in the feature screen.

```tsx
// src/app/anime/[id].tsx
import { AnimeDetail } from '@/features/anime/screens/anime-detail'

export default function AnimeDetailScreen() {
  return <AnimeDetail />
}
```

- Function name is `PascalCase` + `Screen` suffix (`AnimeDetailScreen`, `HomeScreen`).
- Per-screen navigation UI (`Stack.Title`, `Stack.Toolbar`, search bar) lives **in the feature screen** — the v57 declarative API renders it from there, next to the state it reads.
- Options shared by every route in a stack (header, presentation defaults) go in the route's `_layout.tsx`.

## Rules

### Naming

- **kebab-case** for every folder and file inside `src/` (files, hooks, components alike).
- Route files follow Expo Router conventions (`_layout.tsx`, `[id].tsx`, `(group)/`).
- Platform-specific files use a suffix before the extension: `.ios`, `.android`, `.native` (iOS + Android), `.web`.

### Barrel exports (`index.ts`)

- Every folder-based component/screen **must** have an `index.ts` re-exporting the main file.
- Re-export the file **without** a platform suffix: `export * from './tabs'` (Metro resolves `tabs.web.tsx` automatically).

### Scope of internal folders

- `components/`, `hooks/`, `utils/` nested inside a screen or component folder are **private** to it.
- Anything reused across screens or features belongs in the global folders at the root of `src/`.

### Hooks, utils and constants

- A hook extracted from a screen or component goes in that folder's `hooks/` (`status/hooks/use-status.ts`), never loose next to the component.
- A non-hook helper goes in that folder's `utils/` (`meta/utils/meta-lines.ts`).
- The only loose files allowed are one generic `constants.ts` and/or one generic `utils.ts` at the folder root, while it's the only file of its kind there. A second helper moves them all into `utils/`.

### Code style

- Module-level constants (`const LABEL = …`) go after the last import, never between imports.

### Feature vs global

| Location                      | When to use                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/features/<feature>/`     | Code tied to a specific feature (screens, feature-level providers, hooks, utils)                |
| `src/{components,hooks,...}/`  | Code used by two or more features, or truly generic (design-system components, global hooks)    |

### Platform-specific files

Any module (component, hook, util) with more than one platform implementation **must** live in its own kebab-case folder with an `index.ts` — no flat `foo.tsx` + `foo.web.tsx` pairs at the parent level. The **default file** (`<name>.tsx`) is the fallback implementation and owns the shared props/types; platform files import them from it.

```
chart/
├── chart.tsx           # default (also web) — exports ChartProps type
├── chart.ios.tsx       # iOS override — imports ChartProps from './chart'
├── chart.android.tsx   # Android override
└── index.ts            # export * from './chart'
```

Metro resolves the correct file at build time; `index.ts` always points to the unsuffixed one. Consumers import the folder (`@/components/ui/chart`) and never a platform file directly.

A platform file can import **types** from `./chart`, but never runtime values: inside `chart.ios.tsx`, `./chart` resolves back to `chart.ios.tsx` itself. Logic shared by every platform lives in the folder's `hooks/` or `utils/`.

### Native screens

Native screens (`.ios.tsx` / `.android.tsx`) write SwiftUI / Jetpack Compose through `@expo/ui` directly; the web file keeps PanelUI and Uniwind. No shared component API translates one into the other.

- **Inside a `Host`, no `className`.** Layout and styling are the platform's own stacks and `modifiers`. Uniwind classes are for React Native views (web, the `Host` itself, headers, lists).
- **Text** comes from `@/components/native/swift-ui/text` or `@/components/native/jetpack-compose/text`: the native `Text` in the app's font. On Android it always takes a `typography` (default `bodyLarge`), since `@expo/ui`'s Compose `Text` never inherits a slot's text style; name the slot's style where M3 sets one (`labelLarge` in a button, `labelSmall` in a badge).
- **Colors** on Android come from one `useThemeM3Colors()`; destructive actions use `m3.error` / `m3.onError`, not a second scheme seeded from `destructive`.
- **Spacing** in dp: `GUTTER_*` from `@/components/native/constants`, plain numbers otherwise.
