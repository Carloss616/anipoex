# APK fixture

`fixture.apk` is a fake extension for the signature, rollback and icon tests: package `eu.kanade.tachiyomi.extension.all.fixture`, `versionName` `1.4.1`, `tachiyomix.name` `Fixture`, `tachiyomi.extension.class` `.Fixture`, and the icon in `res/` at two densities. It has no `classes.dex`, so it verifies but can't be converted or loaded.

`fixture-badclass.apk` is the same APK plus a `classes.dex` built with `d8` from `Fixture.java`, a plain class that isn't a `Source` or `SourceFactory`: it verifies and converts, then fails to load.

`make-fixture.sh` builds both with `aapt2` and `d8` from the newest build-tools and platform under `$ANDROID_HOME` (default `~/Library/Android/sdk`) and signs both (v2 only) with `apksigner` and one throwaway keystore that isn't kept; it needs `javac` and `keytool` on the `PATH`. Running it again makes a new key, so update the digest below, which `ApkReaderTest` reads.

Signing certificate SHA-256:

```
9c32f490b4db5d6f14ee7371c7ff603d2712ab5ba71f9e3a5b081c778f30e5fb
```
