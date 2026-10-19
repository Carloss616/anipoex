#!/bin/sh
# Rebuilds both fixtures, v2-signed with one throwaway key: fixture.apk (manifest and both icons, no classes.dex) and fixture-badclass.apk (the same plus a dex whose extension class isn't a Source).
set -eu
cd "$(dirname "$0")"
sdk="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
tools="$sdk/build-tools/$(ls "$sdk/build-tools" | sort -V | tail -1)"
platform="$sdk/platforms/$(ls "$sdk/platforms" | sort -V | tail -1)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
# --no-crunch keeps the PNGs byte for byte, so the tests can compare them with res/.
"$tools/aapt2" compile --no-crunch --dir res -o "$work/res.zip"
"$tools/aapt2" link -I "$platform/android.jar" --manifest AndroidManifest.xml -o "$work/unsigned.apk" "$work/res.zip"
javac --release 8 -nowarn -d "$work/classes" Fixture.java
"$tools/d8" --min-api 24 --lib "$platform/android.jar" --output "$work" "$work/classes/eu/kanade/tachiyomi/extension/all/fixture/Fixture.class"
cp "$work/unsigned.apk" "$work/unsigned-badclass.apk"
(cd "$work" && zip -q unsigned-badclass.apk classes.dex)
keytool -genkeypair -keystore "$work/key.jks" -storepass fixture -alias fixture -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Fixture" >/dev/null 2>&1
for apk in fixture fixture-badclass; do
    unsigned="$work/unsigned${apk#fixture}.apk"
    "$tools/apksigner" sign --ks "$work/key.jks" --ks-pass pass:fixture --v1-signing-enabled false --v2-signing-enabled true --v3-signing-enabled false --v4-signing-enabled false --out "$apk.apk" "$unsigned"
done
"$tools/apksigner" verify --print-certs fixture.apk | grep 'SHA-256'
"$tools/apksigner" verify --print-certs fixture-badclass.apk | grep 'SHA-256'
