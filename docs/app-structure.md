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
│   │   ├── layout/                  # structure (header, tabs, toolbar…)
│   │   ├── blocks/                  # product pieces built from ui/ (empty-state, theme-toggle…)
│   │   │   ├── <component>/         # complex or multi-platform component
│   │   │   │   ├── <sub-component>/ # only used by this component (no nested components/)
│   │   │   │   ├── <component>.tsx
│   │   │   │   └── index.ts         # export * from './<component>'
│   │   │   └── <component>.tsx      # simple component — single file, no folder
│   │   └── native/                  # native Text, Image, TabbedPager and constants for SwiftUI / Compose
│   ├── hooks/                       # global hooks
│   ├── providers/                   # global providers
│   └── utils/                       # global helpers
├── modules/extension-runtime/{android,jvm}  # Mihon extension host: Android module, shared JVM core (desktop + iOS)
├── desktop/                         # Electron app (macOS) that runs the JVM core as a sidecar
└── assets/                          # images, fonts, icons (@/assets/*)
```

Every global component sits in one of the four groups; nothing loose at the root of `components/`.

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
        │   ├── episode-list.tsx
        │   └── episode-sheet/       # its own pieces sit beside it, not in components/
        │       ├── episode-row/
        │       ├── episode-sheet.tsx
        │       └── index.ts
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
- **One `components/` per path.** A component that already sits under a `components/` folder (global, a feature's or a screen's) keeps its private pieces directly in its own folder (`tracking-sheet/status/`, `manga-card/cover-image/`), never in another `components/`.
- Anything reused across screens or features belongs in the global folders at the root of `src/`.

### Hooks, utils and constants

- A hook extracted from a screen or component goes in that folder's `hooks/` (`status/hooks/use-status.ts`), never loose next to the component.
- A non-hook helper goes in that folder's `utils/` (`meta/utils/meta-lines.ts`).
- The only loose files allowed are one generic `constants.ts` and/or one generic `utils.ts` at the folder root, while it's the only file of its kind there. A second helper moves them all into `utils/`.

### Code style

- Module-level constants (`const LABEL = …`) go after the last import, never between imports.
- An icon in `Icons` (`src/components/ui/icon/icons.ts`) is always referenced from there, never as its glyph name, so changing the registry changes every place: also SwiftUI `systemImage` (`sfSymbol(Icons.refresh)`) and toolbar `icon` props. Only glyphs it doesn't hold stay inline.

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

The default file takes the same extension as its platform files, even without JSX: Metro tries every platform for `.ts` before any for `.tsx`, so a default `chart.ts` beats `chart.ios.tsx` and native runs the web code.

A platform file can import **types** from `./chart`, but never runtime values: inside `chart.ios.tsx`, `./chart` resolves back to `chart.ios.tsx` itself. Logic shared by every platform lives in the folder's `hooks/` or `utils/`.

A module that only does something on web (keyboard behavior, a web-only wrapper) keeps the default file as the native passthrough, which owns the props, and puts the web code in `<name>.web.tsx` (`src/components/ui/overlay-scope/`).

### Native screens

Native screens (`.ios.tsx` / `.android.tsx`) write SwiftUI / Jetpack Compose through `@expo/ui` directly; the web file keeps PanelUI and Uniwind. No shared component API translates one into the other.

- **Inside a `Host`, no `className`.** Layout and styling are the platform's own stacks and `modifiers`. Uniwind classes are for React Native views (web, the `Host` itself, headers, lists).
- **Text** comes from `@/components/native/swift-ui/text` or `@/components/native/jetpack-compose/text`: the native `Text` in the app's font. On Android it always takes a `typography` (default `bodyLarge`), since `@expo/ui`'s Compose `Text` never inherits a slot's text style; name the slot's style where M3 sets one (`labelLarge` in a button, `labelSmall` in a badge).
- **Remote images** come from `@/components/native/swift-ui/image` or `@/components/native/jetpack-compose/image` (`modules/native-image`: SDWebImage / Glide, the engines behind expo-image). Never `@expo/ui`'s Compose `Image` for a URL: it decodes at full size, and a source's oversized cover (5492×8000) kills the app with "Canvas: trying to draw too large bitmap".
- **No RN view per list item inside a `Host`.** An `RNHostView` in every grid card (an RN `LinearGradient` scrim) took the Android manga grid from 7% to 19% janky frames. Draw it in Compose: a gradient is the `linearGradient` modifier (`@/components/native/jetpack-compose/linear-gradient`, registered by `modules/modifiers`), on any component (`manga-card.android.tsx`).
- **Colors** on Android come from one `useThemeM3Colors()`; destructive actions use `m3.error` / `m3.onError`, not a second scheme seeded from `destructive`.
- **Spacing** in dp: `GUTTER` from `@/components/native/constants`, plain numbers otherwise.
- **iOS list rows**: tap is the row's primary action; secondary actions go in a `ContextMenu` (all of them) and `SwipeActions` (the frequent ones), never as trailing icon buttons. The trailing edge only shows state (checkmark, loader) or one labeled pill when the row exists for that action (App Store's Install/Update). The content takes `ROW_FILL` (`@/components/native/swift-ui/constants`) so every gesture lands anywhere on the row. See `source-sheet/available-item/available-item.ios.tsx`, `extension-list/components/list-item/list-item.ios.tsx`.
- **`expo-widgets` layouts** (`'widget'` functions: Live Activities, custom notifications) run in their own runtime: only raw `@expo/ui` components, no house `Text`/`Icon`, no module-scope values; pass icons and strings in props. Android's notification text is black unless colored: take colors from `getMaterialColors()`, the device palette in the shade's scheme. Their folder is exempt from the restricted-imports lint in `biome.json` (`manga/utils/scan-activity/`).
- **Loops run in Reanimated, not Compose.** In the source sheet's list, `@expo/ui`'s animated modifiers (`background` with `animationSpec`, `graphicsLayer` with `animated`) jump to their target, and it has no repeating animation: a pulse is PanelUI's `Skeleton` in an `RNHostView` (`rail-content/rail-content.android.tsx`).
- **Sheets sit beside lists, not in their rows.** A `BottomSheet` inside a Compose `LazyColumn` row closes and reopens when the list re-lays out (it empties while scrolled): render it next to the list and share its open state through an observable (`manga-detail/components/source-sheet/source-sheet.tsx`).
- **iOS header buttons**: a sheet's title row uses glass circles with a secondary icon in a 20pt frame (`tracking-sheet/overview/overview.ios.tsx`); two or more share one glass capsule, as a native toolbar groups its items, with an active one tinted primary (`source-sheet/sheet-content/sheet-content.ios.tsx`); a `Section` header's action is text, a borderless button or a `Menu` from `@/components/ui/menu` with a text label (`source-sheet.ios.tsx` "Manage", the extension list's "Update all").
