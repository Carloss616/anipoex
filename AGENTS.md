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
- Inside a `Host`, a parent re-render re-runs every row callback and a new `data` array bumps the list's revision: keep state out of the list's parent.
- Item animations are `itemLayoutAnimation` on the house `LegendList`. On web the package's `AnimatedLegendList` swaps the scroller for react-native-web's `ScrollView` and leaves rows blank on a fast scroll, so `src/components/layout/animated-legend-list/animated-legend-list.web.tsx` animates the browser build's cells through its untyped `internal` signals: re-check it when `@legendapp/list` is upgraded.

# Gestures and animation

- Reanimated shared values go through `get()`/`set()`, never `.value`: the Compiler takes a `.value` inside a worklet for a render dependency and reads it while rendering, which Reanimated warns about on every render (`chapter-reader/components/zoom-view/zoom-view.tsx`).
- A gesture-handler gesture over a React Native `ScrollView` loses on Android: the scroll claims moving fingers first and the system cancels the gesture. Render the scroller as the gesture handler's `ScrollView` with `disallowInterruption={false}`, so the gesture takes the touch over (`zoom-view.tsx`'s `renderScrollComponent`).

# Navigation

- A screen whose native header hides and shows must be a push, not a modal: on iOS, changing a modal's header visibility remounts the screen and loses its state (the reader is a push with `animation: "slide_from_bottom"`, `src/app/(tabs)/manga/_layout.tsx`).
- A `Stack.Toolbar` in a header slot forces `headerShown: true` over `Stack.Header hidden`: unmount the toolbar while the header is hidden.
- `router.navigate` pushes like `push`: a web tab bar calling it put a second `manga/index` on the stack, and both screens' `ViewSheet`s opened on their shared module-level `open$`, each making the other inert. Switch tabs with `useTabTrigger().switchTab` (`src/components/layout/tabs/tabs.web.tsx`).

# Styling

- Uniwind builds native styles from every class it scans, `.web.tsx` included, and its `calc()` can't add `%` to another unit: `calc(100%-1.5rem)` logs "Invalid calc, you can't mix % with other units". Write it without the sum (the header's mask runs `to_top` from a fixed stop, `src/components/layout/header/header.web.tsx`).
- A react-native-web `View` defaults to `flex-shrink: 0`, so a `maxHeight` on its parent never reaches it: PanelUI's `Popover` caps the box around the panel, and a menu taller than the window ran off-screen with nothing to scroll. The panel takes `min-h-0 shrink` (`src/components/ui/menu/menu.tsx`).

# Accessibility (web)

- Web keyboard behavior lives in the `src/components/ui` wrappers, not in PanelUI: overlays wrap their content in `OverlayScope` (focus contained and restored, Escape closes the top-most, page hidden from screen readers). react-aria is imported only in the `.web.tsx` files of `overlay-scope/`, `arrow-key-group/` and `hidden-range/` (Biome); their default file renders its children, so native never loads it.
- react-native-web forwards key, focus, `role`, `tabIndex` and `aria-*` props to the DOM but not pointer events: react-aria's `usePress`/`useHover` can't drive RN views. Hover is CSS (`hover:`), which Uniwind emits as real classes on web. The focus ring is one base rule in `src/global.css` for every focusable element: components don't add it, a `className` overrides it, `tabindex="-1"` opts out, an element that fills a clipping parent (a full-width row) takes `data-ring="inset"` to draw it inside, and a container whose children join into one shape (a card of cells, an attached ButtonGroup) takes `data-attached="row|column"` (the class `attached-row|column` where only a `className` reaches it, like `NumberInput`), nesting for grids: its end children get its corners and every ring inside goes inset (`tracking-sheet/overview/overview.tsx`).
- react-native-web's `TextInput` stops every `keydown` from bubbling: a wrapper that reacts to a field's keys listens with `onKeyDownCapture` (`src/components/ui/number-input/number-input.web.tsx`).
- A pressable `Item` with buttons of its own keeps `Item.Actions` as its sibling, `absolute inset-e-4 inset-y-0` over it, and leaves their width with a spacing-scale `pe-*` on the `Item` (`pe-17` in `chapter-item.tsx`; `available-item.tsx` switches it when a button appears). Never buttons inside a button: react-native-web makes any `role="button"` a `<button>`, and even a `div[role=button]` hides the inner ones from screen readers.
- The web `BottomSheet` is vaul on Radix Dialog, whose focus trap and capture-phase Escape only know the drawer, not PanelUI's portals mounted beside it: a dialog opened from a sheet never got focus, and Escape closed the sheet under it. `OverlayScope` wraps drawer and portal host, its `inert` keeps Radix from pulling focus back, and `onEscapeKeyDown` hands Escape to it (`src/components/ui/bottom-sheet/bottom-sheet.tsx`). vaul's `modal` prop never reaches Radix, so it can't turn the trap off. Radix keeps each direct child of `Drawer.Portal` mounted only while that child animates out, and `OverlayScope` doesn't: the portal is `forceMount` and the sheet unmounts itself after vaul's 0.5s exit, with `OverlayScope open={false}` meanwhile. Radix's scroll lock also cancels the wheel outside the drawer, so the portal host stops `wheel` and `touchmove` from reaching the document.
- PanelUI restores focus to a closed menu's trigger after its exit animation, and Reanimated's entering animation keeps new content untabbable for a few frames, so react-aria's `autoFocus` alone lands nowhere: `OverlayScope` pulls stray focus into the top-most open scope itself.

# Persistence

- Legend's MMKV and localStorage persist plugins load a whole table at startup and rewrite all of it on every change. Data that grows per item (chapter lists) goes in a lookup observable whose `synced` get/set reads and writes one entry (`src/features/manga/state/chapters.ts`).

# Desktop

- A hidden Electron window (`show: false`) paints no frames: `requestAnimationFrame` never fires and `IntersectionObserver` never reports, even with `backgroundThrottling: false`, so a Cloudflare check stalls there. To keep a page running unseen, show it with `showInactive()` at opacity 0 and `setIgnoreMouseEvents(true)` (`desktop/challenge.js`).

# No source names

The repo stays unassociated with any source, like the open-source apps it follows.

- Code, tests, fixtures, mocks, docs, `okf/`, comments and commit messages never name a real source, extension, extension repository or its maintainers: no site names, domains, package names or source ids. Where an example helps, say "a source" or "some sources".
- Placeholders are plainly generic (`Example`, `Source A`, `source-1`), never invented brand-like names, which can collide with real sources.
- Open-source apps that stay neutral too (Mihon, Suwayomi) may be named and credited.

# Domain knowledge

`okf/` is the domain bundle in [Open Knowledge Format](okf/README.md) and the single owner of what things mean: the AniList operations, what the device stores, and the domain rules (list entry, statuses, tracking rules, score format, sources). Read it on demand, when the question is "what is X?" rather than "how do I code X?"; start at [okf/index.md](okf/index.md). When one of those changes, update its page and `okf/log.md` in the same change (`.claude/rules/okf.md` loads with those files).

Where guidance goes: what something *means* → `okf/`; how code is organized → `docs/app-structure.md`; needed only when editing certain files → a `.claude/rules/` file with `paths:`. Never two copies: the other side gets a one-line pointer. Claude Code reads this file directly; don't add a `CLAUDE.md` or `CLAUDE.local.md`, since either one makes it skip `AGENTS.md`. When a task teaches something worth keeping, [.claude/rules/agents-md.md](.claude/rules/agents-md.md) says when it earns a line and where.
