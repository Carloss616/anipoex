# Mihon extensions

anipoex runs [Mihon](https://github.com/mihonapp/mihon) extensions (extensions-lib 1.4 and 1.6) inside the app on Android, iOS and the macOS desktop app, with no server. The web app in a browser shows the catalog but can't install. What an extension, a repo or a source *means* lives in [okf/](../okf/index.md); this page shows how the pieces fit.

## Overview

Every platform answers the same `RuntimeApi` (`src/features/extensions/runtime/runtime.ts`), so the screens don't know where the extensions run. Below the bridge, all three load the same host classes (`eu.kanade.tachiyomi.*`, in `modules/extension-runtime/android/src/main/java`), the API extensions are compiled against. Android runs them in ART; desktop and iOS compile them into one JVM jar (`modules/extension-runtime/jvm`) with Android shims, reached through a single entry point, `Bridge.call(method, json)`.

```mermaid
flowchart TD
    UI["Screens"] --> API["1 · RuntimeApi"]

    subgraph AND["Android"]
        A1["runtime.android.ts"] --> A2["2 · Expo module"] --> A3["3 · ART class loader"]
    end
    subgraph DESK["macOS desktop"]
        D1["runtime.web.ts"] --> D2["4 · preload + IPC"] --> D3["5 · JVM sidecar"]
    end
    subgraph IOS["iOS"]
        I1["runtime.ios.ts"] --> I2["6 · Expo module"] --> I3["7 · Embedded JVM"]
    end

    API --> A1 & D1 & I1
    D3 & I3 --> CORE["8 · JVM core"]
    A3 & CORE --> HOST["9 · Host classes"]
    HOST --> EXT["Extension APK"]

    classDef step fill:#dbe7f5,stroke:#6A8CAF,color:#141413
    classDef ask fill:#f7e8c4,stroke:#c9a13b,color:#141413
    classDef good fill:#788C5D,stroke:#5d6f47,color:#ffffff
    classDef bad fill:#D97757,stroke:#b65f42,color:#ffffff
    classDef calm fill:#ebe9e2,stroke:#87867F,color:#141413
    class UI,A1,D1,I1 calm
    class API,CORE,HOST step
    class A2,A3,D2,D3,I2,I3 calm
    class EXT bad
    style AND fill:#78a35a1a,stroke:#788C5D
    style DESK fill:#6a8caf1a,stroke:#6A8CAF
    style IOS fill:#8b6fb31a,stroke:#8b6fb3
```

1. **RuntimeApi**: `install` · `installed` · `uninstall` · `search` · `chapters` · `pages` · `mangaWebUrl`, the same on every platform.
2. **Expo module** `ExtensionRuntimeModule.kt`.
3. **ART class loader**: loads the APK as is.
4. **preload + IPC**: the renderer's `window.anipoex`, answered by `main.js`.
5. **JVM sidecar**: a child process speaking JSON lines on stdin/stdout.
6. **Expo module** `ExtensionRuntimeModule.swift`.
7. **Embedded JVM**: inside the app, reached over JNI by `JvmHost`.
8. **JVM core** (`modules/extension-runtime/jvm`): `Bridge.call`, apksig, dex repair, dex2jar, Android shims.
9. **Host classes** `eu.kanade.tachiyomi.*`: one source, compiled into the Android app and into the JVM core.

Desktop and iOS share `bridgeRuntime` (`runtime/utils/bridge-runtime.ts`), which turns the `{result}` / `{error}` envelope that `Bridge.call` returns into `RuntimeApi`. The web app in a browser has no bridge, so `runtime.ts` answers with an empty list and a "runs in the Android, iOS and desktop apps" error.

## What the user does

The flow is the same on every platform; only the runtime underneath changes.

```mermaid
flowchart LR
    R["1 · Add a repo"] --> C["2 · Catalog"] --> I["3 · Install"] --> S["4 · Pick a source"] --> M["5 · Match the manga"] --> L["6 · Chapters"] --> P["7 · Read"]

    classDef step fill:#dbe7f5,stroke:#6A8CAF,color:#141413
    classDef ask fill:#f7e8c4,stroke:#c9a13b,color:#141413
    classDef good fill:#788C5D,stroke:#5d6f47,color:#ffffff
    classDef bad fill:#D97757,stroke:#b65f42,color:#ffffff
    classDef calm fill:#ebe9e2,stroke:#87867F,color:#141413
    class R,C,S calm
    class I,M,L,P step
```

Grey stays in JavaScript; blue crosses into the runtime.

1. **Add a repo**: its URL, trusting its signing key.
2. **Catalog**: every repo's index, merged by package.
3. **Install**: the APK is checked against the repo's key.
4. **Pick a source**: on the manga detail, one of the installed sources.
5. **Match the manga**: the AniList manga searched by title in that source.
6. **Chapters**: the list from the source.
7. **Read**: the chapter's pages from the source.

Repos, the catalog and the picked source are JavaScript (`src/features/extensions`, `src/features/manga`); only installing and calling a source cross into the runtime.

`pages(sourceId, chapterUrl, memo?)` returns `[{ index, imageUrl, headers }]`: the chapter's images with the headers each one needs (Referer, for example). Android and iOS load them with expo-image, sending those headers. `memo` is the chapter's `SChapter.memo` from `chapters`, as an opaque JSON string (null when empty): lib 1.6 sources store data there while listing and read it back in `getPageList`, so the reader passes it along. Known limit: sources that rewrite or unscramble images in their OkHttp client interceptors don't work yet, since the app downloads with the URL and headers only.

## Installing an APK on the JVM (desktop and iOS)

Android loads the APK as is with a `DelegateLastClassLoader`. The JVM can't run dex, so desktop and iOS convert it first. The signature is checked before any extension code is touched, and a failure at any step leaves the previous version installed.

```mermaid
flowchart TD
    D["Download the APK"] --> V{"1 · Signature OK?"}
    V -->|no| X["Rejected"]
    V -->|yes| M["2 · Read the manifest"]
    M --> R["3 · Repair the dex"]
    R --> J["4 · dex2jar"]
    J --> F["5 · Fix java/util/Object"]
    F --> Z["6 · Build the jar"]
    Z --> L{"7 · Classes load?"}
    L -->|no| B["Previous version back"]
    L -->|yes| OK["Installed"]

    classDef step fill:#dbe7f5,stroke:#6A8CAF,color:#141413
    classDef ask fill:#f7e8c4,stroke:#c9a13b,color:#141413
    classDef good fill:#788C5D,stroke:#5d6f47,color:#ffffff
    classDef bad fill:#D97757,stroke:#b65f42,color:#ffffff
    classDef calm fill:#ebe9e2,stroke:#87867F,color:#141413
    class D,M,R,J,F,Z step
    class V,L ask
    class X,B bad
    class OK good
```

1. **Signature OK?**: apksig checks the signature and that the signer is the repo's key. Nothing is stored otherwise.
2. **Read the manifest**: package, version, lib version, name, icon.
3. **Repair the dex**: constructors R8 inlined.
4. **dex2jar**: dex to JVM classes.
5. **Fix java/util/Object**: rewritten to `java/lang/Object`, a dex2jar bug.
6. **Build the jar**: the classes plus the APK's resources (`assets/`).
7. **Classes load?**: on success it keeps `package.jar` + `package.json`; on failure the previous jar and meta are restored.

## Android

The Android runtime lives in `modules/extension-runtime/android`: an Expo module (`ExtensionRuntimeModule.kt`) plus the `eu.kanade.tachiyomi.*` host classes, adapted from Mihon and compiled into the app. These are the same source files the JVM core compiles for desktop and iOS, but Android doesn't use the JVM core itself. JS reaches it through `src/features/extensions/runtime/runtime.android.ts` (`requireNativeModule("ExtensionRuntime")`). An installed extension is the repository's APK, stored privately as `files/exts/<pkg>.ext` (read-only) and loaded with a `DelegateLastClassLoader` whose parent is the app's class loader, so the extension's own classes win and the host API comes from the app. ART runs the dex as is: no JVM, no dex repair, no dex2jar. Both extensions-lib 1.4 (RxJava) and 1.6 (suspend) are supported; signatures are read by `PackageManager`, the icon is extracted from the APK, and consumer R8 rules keep the host API in release builds.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Manga detail
    participant Store as selectSource
    participant Bridge as runtime.android.ts
    participant Module as ExtensionRuntimeModule
    participant Src as Extension source
    participant Site as Website
    rect rgba(106,140,175,0.15)
        UI->>Store: pick a source
        Store->>Bridge: search
    end
    rect rgba(120,140,93,0.15)
        Bridge->>Module: search
        Module->>Module: find the source
        Module->>Src: getSearchManga
    end
    rect rgba(217,119,87,0.15)
        Src->>Site: HTTP
        Site-->>Src: HTML or JSON
    end
    Src-->>Module: MangasPage
    Module-->>Bridge: mangas, hasNextPage
    Bridge-->>Store: results
    Store-->>UI: match saved
```

Blue is JavaScript, green the native module, orange the network.

- **2**: `search(sourceId, title, 1)`.
- **3**: an Expo async function.
- **4**: stored extensions load on first use.
- **5**: on `Dispatchers.IO`; 1.4 sources answer through `fetchSearchManga` (Rx).
- **6**: with the host's OkHttp client.
- **10**: native errors cleaned.
- **11**: the exact-title match.

```mermaid
flowchart TD
    A["installExtension"] --> B["1 · Download"]
    B --> C["2 · Read the APK"]
    C --> D{"3 · Repo's key?"}
    D -->|no| X["Rejected"]
    D -->|yes| E{"4 · lib 1.4 or 1.6?"}
    E -->|no| X
    E -->|yes| F["5 · Store it"]
    F --> G{"6 · Sources load?"}
    G -->|no| R["Previous version back"]
    G -->|yes| H["7 · Register"]
    H --> I["Catalog reloads"]

    classDef step fill:#dbe7f5,stroke:#6A8CAF,color:#141413
    classDef ask fill:#f7e8c4,stroke:#c9a13b,color:#141413
    classDef good fill:#788C5D,stroke:#5d6f47,color:#ffffff
    classDef bad fill:#D97757,stroke:#b65f42,color:#ffffff
    classDef calm fill:#ebe9e2,stroke:#87867F,color:#141413
    class A,I calm
    class B,C,F,H step
    class D,E,G ask
    class X,R bad
```

1. **Download**: the APK to a temp file.
2. **Read the APK**: metadata and signing certificates (`getPackageArchiveInfo`).
3. **Repo's key?**: rejected and the temp file deleted otherwise.
4. **lib 1.4 or 1.6?**: the extensions-lib versions the host supports.
5. **Store it**: back up the old version, move the APK to `files/exts/<pkg>.ext`, read-only.
6. **Sources load?**: a `DelegateLastClassLoader` instantiates `Source` or `SourceFactory`.
7. **Register**: the sources, and the icon extracted.

Known limits:

- Cloudflare challenges are not solved yet (the Cloudflare interceptor passes requests through) and there is no cookie jar.
- Not provided yet: QuickJS (`JavaScriptEngine`), `rateLimit`/`rateLimitHost`, `HttpSource.fetchImage`; an extension that calls them fails when that code runs.
- Extensions are private to the app, not installed Android packages: extensions installed by Mihon in its shared mode are not seen, and ours are invisible to other apps.
- Google Play does not allow loading code downloaded at runtime, so the Android build is distributed outside Play.
- Release builds keep kotlin, OkHttp, Okio, Jsoup, RxJava, kotlinx and Injekt whole through consumer R8 rules, so those libraries are not shrunk.
- The debug dev client janks on Compose-heavy lists; measure performance in a release build.

## macOS desktop

Electron (`desktop/`) shows the web export and starts the JVM core as a child process, the sidecar. The renderer reaches it only through the preload's `window.anipoex`: `runtime(method, args)` for `RuntimeApi`, and `signIn(url)` for AniList. The main process accepts calls only from the app's own origin and only for `RuntimeApi` methods. The packaged app serves the web export as `app://anipoex/` and bundles a trimmed JRE (`java.base` + `jdk.crypto.ec`), so it needs neither Metro nor an installed Java.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Screen
    participant RT as runtime.web.ts
    participant PL as preload
    participant MAIN as main.js
    participant SC as sidecar.js
    participant JVM as JVM: Main + Bridge
    participant EXT as Extension
    rect rgba(106,140,175,0.15)
        UI->>RT: search
        RT->>PL: anipoex.runtime
    end
    rect rgba(201,161,59,0.18)
        PL->>MAIN: IPC "runtime"
        MAIN->>MAIN: allowed?
        MAIN->>SC: call
    end
    rect rgba(120,140,93,0.15)
        SC->>JVM: JSON line
        JVM->>EXT: getSearchManga
        EXT-->>JVM: MangasPage
        JVM-->>SC: JSON line
    end
    SC-->>MAIN: reply
    MAIN-->>RT: {result}
    RT-->>UI: MangasPage
```

Blue is the renderer, yellow Electron's main process, green the JVM.

- **1**: `search(sourceId, query, page)`.
- **2**: `anipoex.runtime("search", args)`.
- **4**: only from the app's own origin, and only `RuntimeApi` methods.
- **6**: `{"id":7,"method":"search","args":{...}}`.
- **7**: `getSearchManga(page, query, filters)`.
- **9**: `{"id":7,"result":{...}}`, matched back by `id`.

- Requests carry an `id` and run concurrently; replies can come back in any order.
- If the JVM exits, pending calls get an error and the next call starts it again.
- Page images: the renderer can't send headers, so the main process rewrites each page's `imageUrl` to `anipoex-page://p/<random id>` and serves it itself with the source's headers (`desktop/assets/pages.js`). It serves only URLs a `pages` reply returned (the latest 1000, in memory), only http(s) upstream, never a document (415 for `text/*`, HTML, JavaScript or non-image XML; images keep their `Content-Type`, anything else goes out as `application/octet-stream`), and drops `Origin` (Electron's `net.fetch` fails any request that carries one). The page URLs are unguessable capability URLs (random ids), so the scheme needs no origin check.
- AniList sign-in opens its own window; the main process reads the token from the redirect without loading it.
- Data lives in `~/Library/Application Support/anipoex/` (`anipoex-desktop/` in development). See [desktop/README.md](../desktop/README.md).

Known limits: macOS arm64 only, unsigned; no Cloudflare challenge solving; no source settings screen; Android APIs outside the shims (`Handler`, graphics) fail in the few extensions that use them.

## iOS

iOS has no JVM and doesn't allow JIT, so the app carries its own Java runtime: an interpreter-only OpenJDK Zero (JDK 27, `java.base` only), downloaded from a pinned Mangatan release and packaged as `AnipoexJDK.xcframework` by `modules/extension-runtime/ios/scripts/prepare-runtime.sh`. The simulator slice is the same static library retagged for the simulator, plus an `mprotect` wrapper, because the simulator denies executable memory that Zero never actually runs. `JvmHost.m` boots that runtime once, on the first call, and talks over JNI to the same JVM core the desktop app uses (`modules/extension-runtime/jvm`, entry `Bridge.call`), so installing and running an extension works exactly as on desktop. The Expo module `ExtensionRuntime` exposes a single `call(method, argsJson)`, and `runtime.ios.ts` turns it into `RuntimeApi` with the shared `bridgeRuntime`. Sideload only: the App Store doesn't allow apps that download executable code.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Manga detail
    participant RT as runtime.ios.ts
    participant EM as ExtensionRuntime (Swift)
    participant JH as JvmHost (JNI)
    participant BR as Bridge.call
    participant SRC as Extension source
    rect rgba(106,140,175,0.15)
        UI->>RT: chapters
        RT->>EM: call("chapters")
    end
    rect rgba(139,111,179,0.15)
        EM->>JH: new thread
        JH->>JH: boot the JVM
        JH->>BR: call
    end
    rect rgba(120,140,93,0.15)
        BR->>SRC: getChapterList
        SRC-->>BR: chapters
        BR-->>JH: envelope
    end
    JH-->>EM: envelope
    EM-->>RT: resolve
    RT-->>UI: chapters or error
```

Blue is JavaScript, purple the Swift and JNI host, green the JVM core.

- **1**: `chapters(sourceId, mangaUrl, title)`.
- **2**: `call(method, argsJson)`.
- **3**: with an 8 MiB stack.
- **4**: first call only: `dlopen` AnipoexJDK, `JNI_CreateJavaVM`, init `dataDir`.
- **5**: `call(method, json)` as UTF-16 strings.
- **7**: over HTTPS with OkHttp.
- **8**: `{"result": ...}` or `{"error": ...}`.
- **11**: a rejected promise carries the extension's message.

Installing works as on desktop ([Installing an APK on the JVM](#installing-an-apk-on-the-jvm-desktop-and-ios)); the jar and its meta go to `Application Support/extensions/exts/<pkg>.jar` + `<pkg>.json`, and the sources show up in Extensions and the source picker.

Known limits:

- Tested on the iPhone simulator (arm64 only); the device build compiles but hasn't run on a real iPhone yet.
- It's an interpreter: installing an extension takes about 2.6 s (dex2jar 2.4 s), and the first HTTPS request of a session about 2.5 s while TLS warms up; later searches take 0.4–1.5 s.
- `java.base` only: no legacy CJK charsets (Shift_JIS, EUC-KR, Big5, GBK) and English-only locale data, so dates written in other languages don't parse.
- zstd is stubbed: the app never asks servers for zstd, since the real decoder is a JNI library.
- The runtime adds about 50 MB to the app (framework 40 MB, jars 9.5 MB) and its 9.4 MB library loads at every launch, even when no extension is used.
- No Cloudflare or WebView sources, like the other platforms.
