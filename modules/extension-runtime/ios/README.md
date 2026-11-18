# iOS

Mihon extensions run on an embedded OpenJDK Zero (a static JVM linked into `AnipoexJDK.xcframework`) hosted by [JvmHost.m](JvmHost.m). The JDK framework and the jars are built locally, never committed.

## Build

1. Build the framework and copy the core's jars to `Runtime/` (before `pod install`, `expo run:ios` or prebuild). `bun run ios` runs it first:

   ```bash
   JAVA_HOME=<jdk >= 17> bun run extensions:ios-runtime
   ```

   - It needs a `gradlew`: `android/gradlew`, or `GRADLEW=<path to a gradlew>` (the `android/` folder is generated, so a fresh clone or a worktree has none).
   - It downloads the pinned Mangatan runtime from GitHub (SHA-256 checked), so it needs network access.

2. It rebuilds only what changed: the jars when the JVM core's sources do (`modules/extension-runtime/jvm`, and `android/src/main/java`, which the core shares), the framework when the downloads or its scripts do; otherwise it exits in under a second. The podspec only checks that `Runtime/` exists, so a build that skips this script (`bunx expo run:ios`, Xcode) can run stale jars.

3. Run `pod install` again when a dependency bump renames a jar: CocoaPods fixes the `resource_bundles` file list at `pod install`, and `expo run:ios` skips it while `Podfile.lock` is unchanged. Then delete `ExtensionRuntime.bundle` from DerivedData's `Build/Products` (or clean the build): Xcode leaves the old jar in it, and the old version wins on the classpath (a `NoSuchMethodError` at start).

## Targets

- Simulator: arm64 only. The simulator slice is the device build retagged for the simulator platform, with an `mprotect` wrapper ([scripts/sim-mprotect.c](scripts/sim-mprotect.c)) because the simulator denies the executable mappings the JVM asks for (it only interprets bytecode, so read-write is enough).
- Device: the slice builds but has not been tested on hardware.

## Data

The extensions live in `Application Support/extensions` inside the app's container. OpenJDK's license notice is in [NOTICE-openjdk.md](NOTICE-openjdk.md).
