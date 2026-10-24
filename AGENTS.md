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
- `peek()` for call-time reads (in handlers and actions), `get()` in anything that must update (`isScanning` vs `isScanBusy` in `state/probes.ts`). A `peek()` in render is worse than stale: the Compiler caches it and keeps the first render's value (`use-title-mode.ts` reads the query with `useValue`).

# React Compiler

- A ref written during render (`ref.current = x`) makes the Compiler skip the whole hook or component: everything it returns is new on each render and breaks `memo` downstream. Sync refs in an effect.

# Lists

- Replacing a list with rebuilt objects re-renders every item: keep unchanged items as the same object (`keepUnchanged` in `extensions.ts`).
- `List.ForEach` / `LazyColumn.Items` recycle rows by slot: an insert or removal shifts every following slot, so those rows re-render whatever their props. `recycling={false}` keys by item, for short lists with per-row actions.
- Inside a `Host`, a parent re-render re-runs every row callback and a new `data` array bumps the list's revision: keep state out of the list's parent.

# Gestures and animation

- Reanimated shared values go through `get()`/`set()`, never `.value`: the Compiler takes a `.value` inside a worklet for a render dependency and reads it while rendering, which Reanimated warns about on every render (`chapter-reader/components/zoom-view/zoom-view.tsx`).
- A gesture-handler gesture over a React Native `ScrollView` loses on Android: the scroll claims moving fingers first and the system cancels the gesture. Render the scroller as the gesture handler's `ScrollView` with `disallowInterruption={false}`, so the gesture takes the touch over (`zoom-view.tsx`'s `renderScrollComponent`).

# Navigation

- A screen whose native header hides and shows must be a push, not a modal: on iOS, changing a modal's header visibility remounts the screen and loses its state (the reader is a push with `animation: "slide_from_bottom"`, `src/app/(tabs)/manga/_layout.tsx`).
- A `Stack.Toolbar` in a header slot forces `headerShown: true` over `Stack.Header hidden`: unmount the toolbar while the header is hidden.
- `NativeTabs hidden` on Android remounts every screen of the tab, since expo-router swaps the content's bottom `SafeAreaView` in and out; `patches/expo-router@58.0.23.patch` keeps it and turns only its edge off. Re-check it when expo-router is upgraded.

# Styling

- Uniwind builds native styles from every class it scans, `.web.tsx` included, and its `calc()` can't add `%` to another unit: `calc(100%-1.5rem)` logs "Invalid calc, you can't mix % with other units". Write it without the sum (the header's mask runs `to_top` from a fixed stop, `src/components/layout/header/header.web.tsx`).

# Persistence

- Legend's MMKV and localStorage persist plugins load a whole table at startup and rewrite all of it on every change. Data that grows per item (chapter lists) goes in a lookup observable whose `synced` get/set reads and writes one entry (`src/features/manga/state/chapters.ts`).

# No source names

The repo stays unassociated with any source, like the open-source apps it follows.

- Code, tests, fixtures, mocks, docs, `okf/`, comments and commit messages never name a real source, extension, extension repository or its maintainers: no site names, domains, package names or source ids. Where an example helps, say "a source" or "some sources".
- Placeholders are plainly generic (`Example`, `Source A`, `source-1`), never invented brand-like names, which can collide with real sources.
- Open-source apps that stay neutral too (Mihon, Suwayomi) may be named and credited.

# Domain knowledge

`okf/` is the domain bundle in [Open Knowledge Format](okf/README.md) and the single owner of what things mean: the AniList operations, what the device stores, and the domain rules (list entry, statuses, tracking rules, score format, sources). Read it on demand, when the question is "what is X?" rather than "how do I code X?"; start at [okf/index.md](okf/index.md). When one of those changes, update its page and `okf/log.md` in the same change (`.claude/rules/okf.md` loads with those files).

Where guidance goes: what something *means* → `okf/`; how code is organized → `docs/app-structure.md`; needed only when editing certain files → a `.claude/rules/` file with `paths:`. Never two copies: the other side gets a one-line pointer. Claude Code reads this file directly; don't add a `CLAUDE.md` or `CLAUDE.local.md`, since either one makes it skip `AGENTS.md`. When a task teaches something worth keeping, [.claude/rules/agents-md.md](.claude/rules/agents-md.md) says when it earns a line and where.
