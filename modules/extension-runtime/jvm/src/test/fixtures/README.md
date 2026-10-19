# APK fixture

`fixture.apk` is a fake extension for the signature, rollback and icon tests: package `eu.kanade.tachiyomi.extension.all.fixture`, `versionName` `1.4.1`, `tachiyomix.name` `Fixture`, `tachiyomi.extension.class` `.Fixture`, and the icon in `res/` at two densities. It has no `classes.dex`, so it verifies but can't be converted or loaded.

`fixture-badclass.apk` is the same APK plus a `classes.dex` built with `d8` from `Fixture.java`, a plain class that isn't a `Source` or `SourceFactory`: it verifies and converts, then fails to load.

`fixture-noname.apk` is `fixture.apk` built from `AndroidManifest-noname.xml`: no `tachiyomix.name`, and `android:label` `Tachiyomi: Fixture Label`, for the name an extension gets from its app label.

`make-fixture.sh` builds all three with `aapt2` and `d8` from the newest build-tools and platform under `$ANDROID_HOME` (default `~/Library/Android/sdk`) and signs them (v2 only) with `apksigner` and one throwaway keystore that isn't kept; it needs `javac` and `keytool` on the `PATH`. Running it again makes a new key, so update the digest below, which `ApkReaderTest` reads.

Signing certificate SHA-256:

```
2e7af2d2b3e9ecdde46b8be3af81b00f34d21e4e6de0265c8b492233dab016e1
```
