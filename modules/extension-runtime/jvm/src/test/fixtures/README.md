# APK fixture

`fixture.apk` is a fake extension for the signature, rollback and icon tests: package `eu.kanade.tachiyomi.extension.all.fixture`, `versionName` `1.4.1`, `tachiyomix.name` `Fixture`, `tachiyomi.extension.class` `.Fixture`, and the icon in `res/` at two densities. It has no `classes.dex`, so it verifies but can't be converted or loaded.

`make-fixture.sh` builds it with `aapt2` from the newest build-tools and platform under `$ANDROID_HOME` (default `~/Library/Android/sdk`) and signs it (v2 only) with `apksigner` and a throwaway keystore that isn't kept; it needs `keytool` on the `PATH`. Running it again makes a new key, so update the digest below, which `ApkReaderTest` reads.

Signing certificate SHA-256:

```
5cd293b25c5962b650eaf38b725d476d7f63bf4bbfbec7599c8a326cc4c1b7dd
```
