<div align="center">

<img src="desktop/build/icon.png" width="128" alt="Anipoex icon">

# Anipoex

![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Platforms](https://img.shields.io/badge/iOS_·_Android_·_Web_·_macOS_·_Windows-555555?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)

**A manga tracker for your AniList list that reads chapters from Mihon extensions, on iOS, Android, web, macOS and Windows.**

</div>

> AniList keeps your list; Anipoex keeps it current. It finds the chapters you haven't read across the sources you install, and runs those sources inside the app, with no server of its own.

<div align="center">
  <!-- Preview: add a screenshot or GIF here, e.g. <img src="docs/preview.png" width="600" alt="Anipoex preview"> -->
  <a href="#-quick-start">Quick Start</a> · <a href="#-features">Features</a> · <a href="#-tech-stack">Tech Stack</a> · <a href="#-docs">Docs</a> · <a href="#-roadmap">Roadmap</a>
</div>

---

## 💡 Concept

Tracking manga means two jobs: keeping your list right, and knowing where the next chapter is. Anipoex does the first against [AniList](https://anilist.co), the record of truth, and the second with [Mihon](https://github.com/mihonapp/mihon) extensions: install sources from the repos you trust, and a scan tells you which manga have new chapters (`+N`), picks the source furthest ahead, and opens the reader there.

Everything runs on your devices. Android loads the extensions natively; iOS and the desktop app run them in an embedded JVM. Your choices follow you between devices through your own GitHub gist or a cloud folder.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📋 AniList tracking | Your list by status, with progress, score and dates; tracking rules fill the obvious side effects |
| 🧩 Mihon extensions | Add repos, install extensions (checked against the repo's signing key) and read from their sources |
| 🔎 Source scans | Scan one manga or your whole Reading list: new chapters per source, auto-exclusion of bad sources, auto-pick of the best one |
| 📖 Reader | Chapter pages from the chosen source, with progress saved back to AniList |
| 🏠 Home | Continue reading, trending, recommendations; sections you can reorder |
| 🔄 Sync | Settings, picks, scans and installed extensions across devices, through a GitHub gist or a folder |
| 📱 Native UI | SwiftUI on iOS and Jetpack Compose on Android through `@expo/ui`; PanelUI on the web; theme families |
| 🔔 Scan activity | Scan progress as a Live Activity on iOS and a notification on Android |
| 🖥️ Desktop | A macOS and Windows app (Electron) that runs extensions in a JVM sidecar |

> [!NOTE]
> Extensions download code at runtime, which app stores don't allow: the iOS build is sideloaded and the Android build ships outside Google Play. A plain browser shows your list and the catalog but can't run extensions.

---

## 🚀 Quick Start

Needs [Bun](https://bun.sh), Xcode for iOS and Android Studio for Android. Anipoex runs as an Expo [development build](https://docs.expo.dev/develop/development-builds/introduction/), not Expo Go.

```bash
bun install
bun run ios        # or: bun run android
bun start          # Metro, for later runs
```

<details>
<summary>Environment variables (<code>.env.local</code>)</summary>

```bash
EXPO_PUBLIC_ANILIST_GRAPHQL_URL=https://graphql.anilist.co
EXPO_PUBLIC_ANILIST_AUTHORIZE_URL=https://anilist.co/api/v2/oauth/authorize
EXPO_PUBLIC_ANILIST_CLIENT_ID_NATIVE=12345   # AniList API client for the apps
EXPO_PUBLIC_ANILIST_CLIENT_ID_WEB=12345      # AniList API client for the web
EXPO_PUBLIC_GITHUB_CLIENT_ID=Iv1.0000000000  # GitHub OAuth app, for sync
```

Create the AniList clients at [anilist.co/settings/developer](https://anilist.co/settings/developer) and the GitHub OAuth app (device flow enabled) in your GitHub developer settings.

</details>

<details>
<summary>Web, desktop and the iOS extension runtime</summary>

- **Web**: `bun run web`.
- **Desktop (macOS, Windows)**: start Metro, then `bun run desktop`. See [desktop/README.md](desktop/README.md) for building the JVM sidecar.
- **iOS extension runtime**: `bun run extensions:ios-runtime` downloads and packages the embedded JDK before the first iOS build.

</details>

<details>
<summary>Checks</summary>

```bash
bun run typecheck
bun run check      # Biome
bun test
bun run codegen    # after changing a .gql operation
```

</details>

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| App | Expo SDK 58, React Native 0.88, React 19, Expo Router |
| Native UI | `@expo/ui` (SwiftUI, Jetpack Compose) and local Expo modules |
| Web UI | PanelUI, Uniwind (Tailwind CSS 4) |
| State | Legend State v3 (persisted to MMKV / localStorage) |
| Data | Apollo Client 4 against AniList's GraphQL API, with codegen |
| Extensions | Kotlin host on Android (ART); a shared JVM core on desktop and iOS (OpenJDK Zero on iOS) |
| Desktop | Electron with a JVM sidecar, on macOS and Windows |
| Tooling | Bun, Biome, TypeScript 7 |

<details>
<summary>Project structure</summary>

```
anipoex/
├── src/
│   ├── app/              # Expo Router routes (thin wrappers)
│   ├── features/         # screens and logic by feature (manga, extensions, sync, settings…)
│   ├── components/       # ui, layout, blocks, native
│   ├── state/            # app-wide stores (settings, theme)
│   └── utils/
├── modules/              # local Expo modules, incl. the extension runtime
├── desktop/              # Electron app and JVM sidecar
├── okf/                  # domain knowledge (what each record and rule means)
├── docs/                 # guides with diagrams
└── scripts/              # app icon generator
```

</details>

---

## 📚 Docs

- [Mihon extensions](docs/extensions.md): how extensions run on Android, iOS and the desktop app, with diagrams.
- [Sync and source picking](docs/sync-and-sources.md): what syncs between your devices and what stays, and how a scan picks a source, with diagrams.
- [App structure](docs/app-structure.md): folder layout and conventions.
- [App icon](docs/app-icon.md): how the app icon, splash and favicon are generated.
- [Desktop app](desktop/README.md): run and package the desktop app.
- [Domain knowledge](okf/index.md): what each AniList operation, store and rule means.

---

## 🗺️ Roadmap

- [x] AniList list, detail and tracking
- [x] Mihon extensions on Android, iOS, macOS and Windows
- [x] Source scans, auto-exclusion and auto-pick
- [x] Reader
- [x] Sync through a GitHub gist or a folder
- [x] Desktop app for macOS and Windows
- [ ] Chapter downloads
- [ ] iOS extension runtime on a physical iPhone
- [ ] Signed macOS builds
- [ ] Windows installer (packaging builds only the macOS `.dmg` today)

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Run `bun run typecheck`, `bun run check` and `bun test`
4. Open a pull request

---

## 📄 License

[Carlos Espinoza](https://github.com/Carloss616). Licensed under [MIT](LICENSE).
