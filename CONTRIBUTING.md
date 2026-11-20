# Contributing

Thanks for helping with Anipoex. This page covers building the app, the stack it uses and how to send a change. For what the app does, see the [README](README.md).

## 🚀 Build and run

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
<summary>Web and desktop</summary>

- **Web**: `bun run web`.
- **Desktop (macOS, Windows)**: start Metro, then `bun run desktop`. See [desktop/README.md](desktop/README.md) for building the JVM sidecar.

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

<details>
<summary>Release builds on your machine</summary>

Each one builds from the native project `bun run ios` or `bun run android` (or `bunx expo prebuild`) generated, with the version in `app.json`. For another version, prebuild with the tag: `RELEASE_TAG=vX.Y.Z bunx expo prebuild --no-install`.

| Command | Builds | Signed with | For |
|---|---|---|---|
| `bun run ios:release` | Release app on a simulator or a cabled iPhone | your Xcode team | trying a release build, no Metro |
| `bun run android:release` | Release app on an emulator or a cabled phone | the debug key | trying a release build, no Metro |
| `bun run ios:ipa` | `build/ipa/anipoex.ipa` | ad hoc, with the app's entitlements | installing through SideStore or AltStore |
| `bun run android:apk` | `build/apk/anipoex.apk` | the release key | the same APK as a GitHub release |

- **`android:release`** is signed with the debug key, so it doesn't install over a release APK: uninstall first.
- **`android:apk`** needs `keystore.properties` at the repo root, next to its `.jks`. Both are ignored by git:

  ```properties
  storeFile=anipoex-release.jks
  storePassword=…
  keyAlias=anipoex
  keyPassword=…
  ```

  It fails if the APK isn't signed by the release certificate. Install it with `adb install -r build/apk/anipoex.apk`.
- **`ios:ipa`** carries no Apple signature: SideStore or AltStore sign it on the device.

</details>

<details>
<summary>Releasing</summary>

The release tag is the version: `app.config.ts` turns `vX.Y.Z` into the app version and the build number, so no file changes for a release.

```bash
bun run release:notes -- --bumped-version           # next version from the commits
bun run release:notes -- --tag vX.Y.Z -o notes.md   # edit it before publishing
gh release create vX.Y.Z --notes-file notes.md
```

Publishing the release starts `.github/workflows/release.yml`, which builds the signed APK and an IPA for SideStore and AltStore, and uploads them to the release. The IPA carries no Apple signature: SideStore or AltStore sign it on the device, and find new versions through the `source.json` uploaded beside it, at `https://github.com/anipoex/anipoex/releases/latest/download/source.json`. To rebuild an existing tag, run the workflow on it (`gh workflow run release.yml --ref vX.Y.Z`). The signing key and `.env.local` come from the repo secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ENV_LOCAL`.

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
└── scripts/              # app icon generator, IPA and APK builds
```

</details>

---

## 🤝 Sending a change

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Run `bun run typecheck`, `bun run check` and `bun test`
4. Open a pull request

Code conventions live in [AGENTS.md](AGENTS.md) and [docs/app-structure.md](docs/app-structure.md); what each record and rule means lives in [okf/](okf/index.md).
