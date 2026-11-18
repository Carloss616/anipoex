<div align="center">

<img src="desktop/build/icon.png" width="128" alt="Anipoex icon">

# Anipoex

![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Platforms](https://img.shields.io/badge/iOS_·_Android_·_Web_·_macOS_·_Windows-555555?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)

**An AniList manga tracker that compares every source for each manga and syncs privately across iOS, Android, web, macOS and Windows.**

</div>

> One manga, many sources: Anipoex reads them all, tells you which one is ahead, and follows you to every device you use, through storage only you own.

<div align="center">
  <!-- Preview: add a screenshot or GIF here, e.g. <img src="docs/preview.png" width="600" alt="Anipoex preview"> -->
  <a href="#-multi-source-per-manga">Multi-source</a> · <a href="#-private-sync-on-every-platform">Private sync</a> · <a href="#-how-it-differs">How it differs</a> · <a href="#-quick-start">Quick Start</a> · <a href="#-features">Features</a> · <a href="#-tech-stack">Tech Stack</a> · <a href="#-docs">Docs</a> · <a href="#-roadmap">Roadmap</a>
</div>

<table>
<tr>
<td width="50%" valign="top">

### 🔀 Multi-source

**Every source compared. The one ahead, read.**

- `+N` for each source, not just one
- Outdated, missing and failing sources set aside
- The furthest ahead picked for you, with Undo

<a href="#-multi-source-per-manga">How it works →</a>

</td>
<td width="50%" valign="top">

### 🔐 Private sync

**One setup on iOS, Android, web, macOS and Windows.**

- Your own GitHub gist or synced folder
- No Anipoex account, no server
- Picks, scans and extensions follow you

<a href="#-private-sync-on-every-platform">How it works →</a>

</td>
</tr>
</table>

---

## 💡 Concept

The same manga is published by many sites, and they don't keep pace: one is ten chapters ahead, another stopped, a third numbers its chapters wrong. Most readers tie a manga to one source and leave you to notice when it falls behind. Anipoex keeps every source in play: your list lives on your tracker ([AniList](https://anilist.co) today, more to come), and for each manga it reads all the sources you installed through [Mihon](https://github.com/mihonapp/mihon) extensions, then reads from the one furthest ahead.

You read on more than one device, so your setup follows you, privately: no Anipoex account and no server, just a GitHub gist or a folder you already sync. The extensions run inside the app on every platform: natively on Android, in an embedded JVM on iOS and the desktop app.

---

## 🔀 Multi-source, per manga

A scan reads every installed source for a manga and keeps one result per source:

- **`+N` per source**: how many chapters each one has past your progress.
- **The furthest ahead wins**: ties go to a source with no Cloudflare check, then to your languages. It is picked for you, with Undo, unless you picked one by hand.
- **Bad sources step aside**: outdated, missing or failing sources are excluded for that manga only, and checked again a week later.
- **Suspicious numbering is flagged**: a source far ahead of all the others doesn't win by mistake.
- **Your whole Reading list at once**: a Reading scan goes through every manga you're reading and tells you which have new chapters.

How it decides, step by step: [Sync and source picking](docs/sync-and-sources.md#how-a-scan-picks-a-source).

---

## 🔐 Private sync, on every platform

iOS, Android, the web, macOS and Windows share one setup: your source picks, scan results, exclusions, settings and installed extensions.

- **Storage you own**: a private GitHub gist, a folder kept in sync by iCloud Drive, OneDrive or Syncthing, or both. Anipoex runs no server and has no account of its own.
- **Extensions follow you**: install one on your phone and your computer installs it too.
- **Per-device truth**: a source that fails on one device doesn't break it on the others; failures and automatic picks stay where they happened, your own choices travel.
- **Light on the network**: a device writes and downloads only the files that changed.

What travels and what stays: [Sync and source picking](docs/sync-and-sources.md#what-syncs).

---

## 🆚 How it differs

| | Anipoex | [Mihon](https://github.com/mihonapp/mihon) | [Seanime](https://github.com/5rahim/seanime) | [AnymeX](https://github.com/RyanYuuki/AnymeX) |
|---|---|---|---|---|
| Platforms | iOS, Android, web, macOS, Windows | Android | Server with web and desktop clients; iOS and Android companion | Android, iOS, Windows, macOS, Linux |
| Your list lives in | Your tracker: AniList today, more planned | Its own library; trackers get your progress one way | AniList, plus a local file library | AniList, MyAnimeList or Simkl |
| Chapters come from | Mihon extensions | Mihon extensions | Its extension marketplace | A tracking client, not a reader |
| Sync between devices | Private gist or folder, every platform | Backups, local or to a cloud service | Your server holds it | Through the tracker |
| Needs a server | No | No | Yes, self-hosted | No |

What Anipoex adds:

- **Every source compared, per manga.** Not one source per entry: all of them, with the furthest ahead read for you. The scan rules come from the [manga-source-updates](https://github.com/Carloss616/seanime-extensions/tree/main/src/plugins/manga-source-updates) plugin for Seanime.
- **Private sync on every platform.** Your gist or folder, from iOS to Windows, with no server in between.
- **Mihon extensions beyond Android, with no server.** The same extensions run natively on Android and in an embedded JVM on iOS and the desktop app, where running them elsewhere usually means hosting a server like [Suwayomi](https://github.com/Suwayomi/Suwayomi-Server).
- **Your tracker is the library.** No second library to keep in step: status, progress and dates are read from and saved to your tracker directly. AniList today; more trackers are planned.
- **Native on each platform.** SwiftUI on iOS and Jetpack Compose on Android, rather than one UI drawn everywhere.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔀 Multi-source scans | Every source per manga compared: `+N` each, bad ones set aside, the furthest ahead picked |
| 🔐 Private sync | Picks, scans, settings and extensions across all your devices, through your gist or folder |
| 📋 AniList tracking | Your list by status, with progress, score and dates; tracking rules fill the obvious side effects |
| 🧩 Mihon extensions | Add repos, install extensions (checked against the repo's signing key) and read from their sources |
| 📖 Reader | Chapter pages from the chosen source, with progress saved back to AniList |
| 🏠 Home | Continue reading, trending, recommendations; sections you can reorder |
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
- **iOS extension runtime**: `bun run extensions:ios-runtime` downloads and packages the embedded JDK and the extension runtime's jars; `bun run ios` runs it first, and it skips what hasn't changed.

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
- [ ] More trackers beyond AniList
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
