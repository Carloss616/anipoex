# Desktop

macOS app: Electron loads the web app and runs extensions in a separate JVM process (the sidecar, [sidecar.js](sidecar.js)).

## Development

1. Build the extension server and its JVM (once, and again whenever `modules/extension-runtime/jvm` changes; restart Electron afterwards):

   ```bash
   JAVA_HOME=<jdk ≥ 17> android/gradlew -p modules/extension-runtime/jvm installDist jlinkRuntime
   ```

2. Install Electron:

   ```bash
   bun install --cwd desktop
   ```

3. Start Metro (`bun start`) and open the app:

   ```bash
   bunx --cwd desktop electron .
   ```

   It loads `http://localhost:8081`; set `ANIPOEX_URL` to load another URL.

Without `modules/extension-runtime/jvm/build/jre`, it uses the system `java`, which must be 21 or newer.

Tests: `bun test desktop/`.

## Packaged app

```bash
JAVA_HOME=<jdk ≥ 17> bun run --cwd desktop dist
```

This exports the web app (`build:web`, with the `EXPO_PUBLIC_*` values from `.env.local`), builds the server and the JVM (`build:runtime`, needs a generated `android/`), and produces `desktop/dist/anipoex-<version>-arm64.dmg` (and `desktop/dist/mac-arm64/anipoex.app`). Inside the `.app`, `Contents/Resources/` holds `web/` (served as `app://anipoex/` by [serve.js](serve.js)), `server/` and `jre/`; it needs neither Metro nor an installed Java.

Unsigned: a local build opens normally. A downloaded copy is quarantined and macOS may call it damaged; clear the flag with `xattr -cr /Applications/anipoex.app`.

## Data and log

In development everything lives in `~/Library/Application Support/anipoex-desktop/` (the name comes from `package.json`, so don't change it or the AniList session and the extensions are lost); the packaged app uses `~/Library/Application Support/anipoex/` (its `productName`), with its own session and extensions:

- `extensions/`: the installed extensions.
- `extensions/server.log`: the server's stderr. It is emptied when the server first starts in each app run; if the server crashes and restarts, it keeps appending.
