#!/bin/bash
# Builds build/apk/anipoex.apk, signed with the release key, from the prebuilt
# android/ project. The key is the one keystore.properties names at the repo
# root (storeFile, storePassword, keyAlias, keyPassword); CI writes both.
set -euo pipefail
cd "$(dirname "$0")/../.."

# SHA-256 of the release key's certificate: an APK signed by anything else fails.
SIGNING_CERT_SHA256=3f14029f2326727b91496550d62c35c6e3f2160eb6bdfec23a32a72008b62479

if [[ ! -f keystore.properties ]]; then
  echo "keystore.properties not found: put it and the .jks at the repo root" >&2
  exit 1
fi
prop() { sed -n "s/^$1=//p" keystore.properties | tr -d '\r' | tail -1; }
store="$(prop storeFile)"
[[ "$store" == /* ]] || store="$PWD/$store"
store_password="$(prop storePassword)"
key_alias="$(prop keyAlias)"
key_password="$(prop keyPassword)"

(cd android && ./gradlew assembleRelease \
  -PreactNativeArchitectures=arm64-v8a,armeabi-v7a \
  -Pandroid.injected.signing.store.file="$store" \
  -Pandroid.injected.signing.store.password="$store_password" \
  -Pandroid.injected.signing.key.alias="$key_alias" \
  -Pandroid.injected.signing.key.password="$key_password")

apk=build/apk/anipoex.apk
mkdir -p build/apk
cp android/app/build/outputs/apk/release/app-release.apk "$apk"
sdk="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
apksigner="$(find "$sdk/build-tools" -name apksigner | sort -V | tail -1)"
certs="$("$apksigner" verify --print-certs "$apk")"
grep -q "SHA-256 digest: $SIGNING_CERT_SHA256" <<<"$certs"
echo "Built $apk"
