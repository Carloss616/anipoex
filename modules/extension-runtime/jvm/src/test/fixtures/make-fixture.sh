#!/bin/sh
# Rebuilds fixture.apk: the manifest and both icons, v2-signed with a throwaway key, no classes.dex.
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
keytool -genkeypair -keystore "$work/key.jks" -storepass fixture -alias fixture -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Fixture" >/dev/null 2>&1
"$tools/apksigner" sign --ks "$work/key.jks" --ks-pass pass:fixture --v1-signing-enabled false --v2-signing-enabled true --v3-signing-enabled false --v4-signing-enabled false --out fixture.apk "$work/unsigned.apk"
"$tools/apksigner" verify --print-certs fixture.apk | grep 'SHA-256'
