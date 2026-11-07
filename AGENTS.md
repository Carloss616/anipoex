# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v58.0.0/ before writing any code.

# Project structure and conventions

Read [docs/app-structure.md](docs/app-structure.md) before adding, moving or splitting files: folder layout, platform files, hooks/utils placement and native screen rules.

@docs/app-structure.md

# Fine-grained reactivity

State changes re-render only the box that shows them. React Compiler is on, but it memoizes inside a component; it doesn't stop a child from re-rendering when its parent does. Measure before and after (argent `react-profiler-*`; it keeps commit detail only when one commit is ≥16ms, so count smaller ones through the React DevTools hook). In `onCommitFiberRoot`, a fiber rendered in that commit only if it has both `flags & 1` (PerformedWork) and an `actualStartTime` after the previous commit: either one alone also counts skipped fibers.

Legend State v3 docs for LLMs: [llms.txt](https://www.legendapp.com/open-source/state/v3/llms.txt) (index of per-page `.md` files, e.g. [fine-grained reactivity](https://www.legendapp.com/open-source/state/v3/llms/react/fine-grained-reactivity.md)), [llms-full.txt](https://www.legendapp.com/open-source/state/v3/llms-full.txt) (everything in one file). The repo is on `3.0.0-beta.48`: when the docs and the installed package disagree, `node_modules/@legendapp/state` wins.

- **Per-item state lives in observables keyed by id** (`scanning$[key][id]`, `extensionOperations$[id]`), read in the item that shows it. Never a `Set` or array read at the screen.
- **List items are `memo` components.** A render-prop list (`List.ForEach`, `LazyColumn.Items`, `LegendList`) calls its callback on every parent render, and the Compiler can't cache elements made there. Pass stable props: ids, the source objects, booleans; not the row wrapper rebuilt on each render.
- **A flag every item shows** (a scan running, a field empty) goes in a small `<Computed>` per item, not in an item prop or at the screen.
- **`useValue(obs$)`** re-renders on any change of that node. **`useValue(() => …)`** re-renders only when the result changes (`!==`): return a boolean or string; an object re-renders every time.
- **`<Computed>{() => …}</Computed>`** re-renders with its parent and when what it reads changes. Use it when the function captures props or hook values.
- **`<Memo>{() => …}</Memo>`** never re-renders from its parent (it is `React.memo(Computed, () => true)`), so its closure stays as first rendered. Use it only when the function reads observables and stable functions. `<Memo>{count$}</Memo>` renders a value inside RN text.
- `Computed` and `Memo` re-run on every change of what they read. To react to a derived flag only (`url` → can add), make it a computed observable (`canAdd$`) and read that.

Legend State gotchas:

- `useObservable` with a computed at its root freezes under Fast Refresh: put computeds under a plain root, `useObservable({ canAdd: () => … })` (see `use-manga-list.ts`).
- `@expo/ui` native `Text` takes only a string child: wrap the whole `Text` in `Computed`, never its content.
- To reset state when an observable changes, use `useObserve(obs$, reaction)`, not a `useEffect` keyed on its value: `bun run check:fix` (Biome, unsafe) silently drops deps the effect body doesn't read (`use-title-mode.ts`).
- `peek()` for call-time reads (in handlers and actions), `get()` in anything that must update (`isScanning` vs `isScanBusy` in `state/probes.ts`). A `peek()` in render is worse than stale: the Compiler caches it and keeps the first render's value (`use-title-mode.ts` reads the query with `useValue`).

# React Compiler

- A ref written during render (`ref.current = x`) makes the Compiler skip the whole hook or component: everything it returns is new on each render and breaks `memo` downstream. Sync refs in an effect.

# Lists

- Replacing a list with rebuilt objects re-renders every item: keep unchanged items as the same object (`keepUnchanged` in `extensions.ts`).
- `List.ForEach` / `LazyColumn.Items` recycle rows by slot: an insert or removal shifts every following slot, so those rows re-render whatever their props. `recycling={false}` keys by item, for short lists with per-row actions.
- A SwiftUI `LazyHStack.ForEach` (recycling) in a horizontal `ScrollView` draws nothing: the row has no height until an item is measured. A short rail puts its items straight in a `LazyHStack`, which still builds them only as they scroll in (`home/components/rail-section/rail-section.ios.tsx`).
- Inside a `Host`, a parent re-render re-runs every row callback and a new `data` array bumps the list's revision: keep state out of the list's parent.
- Item animations are `itemLayoutAnimation` on the house `LegendList`. On web the package's `AnimatedLegendList` swaps the scroller for react-native-web's `ScrollView` and leaves rows blank on a fast scroll, so `src/components/layout/animated-legend-list/animated-legend-list.web.tsx` animates the browser build's cells through its untyped `internal` signals: re-check it when `@legendapp/list` is upgraded.
- LegendList pins a sticky header only at the scroller's edge and then jumps it to `stickyHeaderConfig.offset`, so under a floating web header it ran to the screen edge first. The same file's sticky cell lets the browser pin it, in a track that ends at the next header. Only lists with `itemLayoutAnimation` get that cell.
- LegendList's web cells carry an inline `contain: paint`, which clips a card's shadow and lean past the cell: the grid drops it on hover from `contentContainerClassName` (`manga/components/manga-grid/manga-grid.tsx`).

# Gestures and animation

- Reanimated shared values go through `get()`/`set()`, never `.value`: the Compiler takes a `.value` inside a worklet for a render dependency and reads it while rendering, which Reanimated warns about on every render (`chapter-reader/components/zoom-view/zoom-view.tsx`).
- A gesture-handler gesture over a React Native `ScrollView` loses on Android: the scroll claims moving fingers first and the system cancels the gesture. Render the scroller as the gesture handler's `ScrollView` with `disallowInterruption={false}`, so the gesture takes the touch over (`zoom-view.tsx`'s `renderScrollComponent`).
- On web, a Reanimated `exiting` leaves as an absolute copy in the nearest positioned ancestor, so its space frees at once: use it when an element should leave the flow (an unmounted title gives back its `gap`), and a CSS transition when the space itself must animate (`max-height`, `flex-grow`). The copy is placed against that ancestor after taking the element's children, so in a padded or centering parent (a button) wrap it in a `View` of the element's fixed size, or it lands off by the padding or by half its size. A custom `Keyframe` only eases in or runs linear, and one started on a hidden screen (a push in the same tick) never runs: Reanimated's fallback cleanup leaves the view hidden for good. Something that can change off-screen takes a built-in animation (`FadeIn`) or CSS. An `entering` view is `visibility: hidden` until its animation starts, so an input mounted with one can't take `focus()` from the same effect: give the input `visible`, which it inherits otherwise.

# Navigation

- A screen whose native header hides and shows must be a push, not a modal: on iOS, changing a modal's header visibility remounts the screen and loses its state (the reader is a push with `animation: "slide_from_bottom"`, `src/features/manga/utils/manga-stack-screens.tsx`).
- A `Stack.Toolbar` in a header slot forces `headerShown: true` over `Stack.Header hidden`: unmount the toolbar while the header is hidden.
- A sheet route is `formSheet` on native and `transparentModal` on web, where the stack draws `modal` and `formSheet` as plain pages: the web screen draws its own `BottomSheet`, and the screen below passes `visibleWhenBlurred` to its `LegendList`, which otherwise hides as blurred (`src/app/(tabs)/extensions/_layout.tsx`, `extension-list.tsx`).
- A sheet route over a dynamic screen (`manga/[id]/sources`) opened by a link or a web reload has nothing under it, and `unstable_settings.anchor` only takes a stack's static first screen: the sheet replaces itself with the detail and pushes itself back (`use-source-list.ts`). Close it with the screen's `navigation.goBack()`, not `router.back()`, whose global `GO_BACK` pops the detail too on a double tap.
- No react-native-keyboard-controller `KeyboardProvider`, so no `PanelUIProvider` (which mounts it): it replaces the decor-view insets listener react-native-screens reads the keyboard from, and an Android `formSheet` stops rising with the keyboard. The root is a `GestureHandlerRootView` around `ToastProvider`, PanelUI's `PortalProvider` on iOS only (`src/app/_layout.tsx`, `toast.ios.tsx`).
- On Android, `Stack.SearchBar`'s `ref` goes to react-native-screens' own hidden search bar, not to the Compose header, so `cancelSearch()` does nothing there. A screen that handles `onSearchButtonPress` gets a field that empties itself after a submit instead (`clearOnSubmit`, `src/components/layout/header/header.android.tsx`); one that shows a search's results sets the field's text with a `searchText` screen option, which the web header also reads (and opens with), since `setText` can't reach the Compose field (`manga-search/components/search-header/search-header.tsx`).
- The manga detail, reader and sources are shared routes, `src/app/(tabs)/(home,manga)/manga/[id]/`: a manga opened from Home stays in Home's stack, and both stacks declare their screens through `mangaStackScreens` (`src/features/manga/utils/manga-stack-screens.tsx`). A cold link takes the first group alphabetically, `(home)`.
- `router.navigate` pushes like `push`: a web tab bar calling it put a second `manga/index` on the stack, and both screens' `ViewSheet`s opened on their shared module-level `open$`, each making the other inert. Switch tabs with `useTabTrigger().switchTab` (`src/components/layout/tabs/tabs.web.tsx`).

# Styling

- On web, write React Native components (`View`, `Pressable`, a rule as `<View role="separator">`) and `Typography` for text, not HTML tags or React Native's `Text`. A tag stays only where they can't do the job: `<input type="range">`, a `<form>` for Enter (react-native-web drops `onSubmit`), and anything inside a `<p>`, since `View` and `Typography` both render a `div` (`Badge`'s `span`, in `Frame.Description`).
- `Typography` doesn't inherit from a panelui-web button: its preset sets size, weight and color. Give it the button's type, plus `text-inherit` when the color follows the button's state (`src/components/layout/tabs/tabs.web.tsx`).
- Native compiles only `src/global.base.css` (`metro.transformer.js` swaps Uniwind's entry): web-only CSS and the panelui-web `@source` go in `src/global.css`. Our own classes are still built for native, `.web.tsx` included, and Uniwind's `calc()` can't add `%` to another unit: `calc(100%-1.5rem)` logs "Invalid calc, you can't mix % with other units". Write it without the sum (the header's mask runs `to_top` from a fixed stop, `src/components/layout/header/header.web.tsx`).
- Uniwind compiles `dark:` to `@scope (.dark)`, and Moon's and Grass's dark halves are other themes (`moon-dark`): on web the theme store also puts `dark` on `<html>` in any dark mode, so `dark:` (panelui-web's included) works in every family (`src/state/theme/theme.ts`). A `@custom-variant dark` can't change the scope.
- panelui-web's arbitrary values read shadcn's bare variables (`var(--success)`, `var(--muted)`), while the PanelUI theme defines only `--color-*`: without the `:root` aliases in `src/global.css`, a toned `Alert` lost its tint and border. Alias a new name there when a panelui-web component reads one.
- Uniwind's web CSS compiler rejects `@container scroll-state(...)` ("Unexpected token Function", and the whole web build fails), so a pinned sticky header is styled with `stuck:`: a scroll listener toggles `data-stuck` on the DOM when the header has moved off its place in its track, no re-render (`useStuck` in `src/components/layout/animated-legend-list/hooks/use-stuck.ts`). Not an `IntersectionObserver`: a header resting on its pin line (the source sheet's first item, offset 0) looks pinned to one.
- A react-native-web `View` defaults to `flex-shrink: 0`, so a `maxHeight` or fixed height on its parent never reaches it and a scrolling child never gets a bounded box: give it `min-h-0 shrink` (`*:min-h-0 *:shrink` on the parent, `src/components/ui/bottom-sheet/bottom-sheet.tsx`).
- A panelui-web `Frame.Header` whose `Frame.Action` holds a button trims its padding to `py-0.75` and, with no description, spans one row (or the title sits at the top): a rule in `src/global.css` does both for every header, so don't add the classes by hand.
- panelui-web's `Frame.Title` in a row truncates to one line through an `in-data-[slot=frame-content]:truncate` selector, which beats a plain `whitespace-normal`: a row title that must wrap takes `whitespace-normal!` (`home/components/activity-section/activity-section.tsx`).
- panelui-web's `Sheet.Body` is a Base UI `ScrollArea.Content` with an inline `min-width: fit-content`: one long unbreakable line (a URL) widens the whole body past the sheet, truncation included. Give it `min-w-0!`.
- A react-native-web `ScrollView` flex-grows, so a `w-*` on it is ignored beside a flexible sibling (a desktop side column took 62% of the row): give it `flexGrow: 0` and put the width on its content (`manga-detail/components/detail-list/detail-list.tsx`).
- Web glass is the `glass-*` utilities in `src/global.css`, on what floats over content: header button groups, tab bar, sticky `Frame.Header`, menu, bottom sheet (and the `Sheet.Next` it opens, through its `sheet-next:` classes), dialog, and sonner's toast through its `classNames`, tinted by its type (`toast.tsx`). Reduce transparency makes each one solid. `glass-<color>` tints any of them (`glass-chrome glass-muted`), and glass inside inherits it: a `bg-*` can't, since it paints an opaque color the glass never sees. `glass-sheet` is `glass-chrome` tinted `popover` with its own `glass-veil-*`, `glass-blur-*` and `glass-saturate-*`, in an `@apply` after the base one, since a single `@apply` sorts its utilities. The base can't be a bare `glass`: beside `glass-*`, Tailwind calls its `@apply glass-veil-*` circular. Over a panelui-web surface it takes the `!` form: the menu popup's `bg-popover` won the cascade (`menu.tsx`).

# Accessibility (web)

- Web keyboard behavior PanelUI native lacks lives in the `src/components/ui` wrappers; overlays (Dialog, Menu, BottomSheet) are panelui-web, whose Base UI contains and restores focus, closes the top-most on Escape and hides the page from screen readers. The web toast is sonner portaled to `<body>` (`src/components/ui/toast/toast.tsx`): left in the app root, it stacked under an open sheet's portal, which took its clicks.
- react-native-web forwards key, focus, `role`, `tabIndex` and `aria-*` props to the DOM but not pointer events: a hook built on them (`usePress`, `useHover`) can't drive RN views. Hover is CSS (`hover:`), which Uniwind emits as real classes on web. There is no global focus ring: panelui-web brings its own, and any other web pressable takes `PRESS` (`src/components/ui/press.ts`). A container whose children join into one shape (a card of cells, an attached ButtonGroup) takes `data-attached="row|column"`: its end children get its corners (the chapter card, `manga-detail/components/detail-list/detail-list.tsx`).
- A disabled react-native-web `Pressable` (no `onPress`) is `pointer-events: none`, which also kills hover and pointer effects inside it, like a `TiltCard`: with no action, render a plain `View` (`manga/components/manga-card/manga-card.tsx`).
- A react-native-web `Pressable` puts its own `onClick` over the one it's given, so as a Base UI trigger Enter and Space never open it. Pass the trigger with an `onPress` prop (even `undefined`): the house `Menu` then hands it the click as `onPress` and the right-click as `onLongPress`, and the Pressable forwards the rest (the rail's `RailCard`, `manga-card.tsx`). Press feedback is `PRESS` (`src/components/ui/press.ts`), which also holds it while the menu, opened on `mousedown`, is open.
- A pressable `Frame.Row` with buttons of its own keeps `Frame.Actions` as its sibling, `absolute inset-e-4 inset-y-0` over it, and leaves their width with a spacing-scale `pe-*` on the row (`pe-17` in `chapter-item.tsx`; `available-item.tsx` switches it when a button appears). Never buttons inside a button: react-native-web makes any `role="button"` a `<button>`, and even a `div[role=button]` hides the inner ones from screen readers.
- The web `BottomSheet` is panelui-web's `Sheet` (Base UI's drawer), so a Base UI menu, dialog or `Sheet.Next` opened in it shares its overlay tree: focus moves in and Escape closes only the top layer. A PanelUI native portal used in a sheet needs its own `PortalProvider` with the host on `<body>`: the app's host sits in the page Base UI hides, and the popup's transform would capture its `fixed` (`src/components/ui/calendar/calendar.tsx`). It has no snap points: `snapPoints` maps to `size` half or full.

# Apollo

- A query that spreads a fragment `@nonreactive` doesn't re-render on that fragment's fields, and its `data` keeps the first values: read them through `useFragment` once the cache is complete, or a save never shows (`manga/hooks/use-manga-entry.ts`).
- `refetchQueries` by name reaches only watched queries: a cached result no screen shows (another list status) stays stale and `cache-first` serves it. A mutation updates the cached results in its `update` instead (`manga/utils/file-entry.ts`).

# Persistence

- Legend's MMKV and localStorage persist plugins load a whole table at startup and rewrite all of it on every change. Data that grows per item (chapter lists) goes in a lookup observable whose `synced` get/set reads and writes one entry (`src/features/manga/state/chapters.ts`).

# Tests

- Bun's `mock.module` lasts the whole run, not one file, and file order differs by OS (Windows alphabetical, macOS not): never mock a module that has its own test file. Mock what it depends on and set its real state, resetting it in `afterAll` (`extensions/state/extensions.test.ts` with `repos$`).

# Desktop

- A hidden Electron window (`show: false`) paints no frames: `requestAnimationFrame` never fires and `IntersectionObserver` never reports, even with `backgroundThrottling: false`, so a Cloudflare check stalls there. To keep a page running unseen, show it with `showInactive()` at opacity 0 and `setIgnoreMouseEvents(true)` (`desktop/host/challenge.js`).

# No source names

The repo stays unassociated with any source, like the open-source apps it follows.

- Code, tests, fixtures, mocks, docs, `okf/`, comments and commit messages never name a real source, extension, extension repository or its maintainers: no site names, domains, package names or source ids. Where an example helps, say "a source" or "some sources".
- Placeholders are plainly generic (`Example`, `Source A`, `source-1`), never invented brand-like names, which can collide with real sources.
- Open-source apps that stay neutral too (Mihon, Suwayomi) may be named and credited.

# Domain knowledge

`okf/` is the domain bundle in [Open Knowledge Format](okf/README.md) and the single owner of what things mean: the AniList operations, what the device stores, and the domain rules (list entry, statuses, tracking rules, score format, sources). Read it on demand, when the question is "what is X?" rather than "how do I code X?"; start at [okf/index.md](okf/index.md). When one of those changes, update its page and `okf/log.md` in the same change (`.claude/rules/okf.md` loads with those files).

Where guidance goes: what something *means* → `okf/`; how code is organized → `docs/app-structure.md`; needed only when editing certain files → a `.claude/rules/` file with `paths:`. Never two copies: the other side gets a one-line pointer. Claude Code reads this file directly; don't add a `CLAUDE.md` or `CLAUDE.local.md`, since either one makes it skip `AGENTS.md`. When a task teaches something worth keeping, [.claude/rules/agents-md.md](.claude/rules/agents-md.md) says when it earns a line and where.
