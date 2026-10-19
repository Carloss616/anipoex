#!/bin/sh
# Builds ios/Frameworks/AnipoexJDK.xcframework from Mangatan's OpenJDK Zero and copies the core's jars to ios/Runtime/.
set -eu

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
IOS="$ROOT/modules/extension-runtime/ios"
JVM="$ROOT/modules/extension-runtime/jvm"
CACHE="$IOS/.cache"
XCFRAMEWORK="$IOS/Frameworks/AnipoexJDK.xcframework"
RELEASE="https://github.com/1Selxo/Mangatan/releases/download/embedded-openjdk-ios13-v16"
JDK_ZIP_SHA=f21681caae40e508647e7f18c9082f27fa9aa67ee7f1376725eae528fa2d38cb
BUNDLE_ZIP_SHA=15369b9bb9dfdd400c18c56b30e2f6cf316b81d4e0bae5ddd6b1fe72355c4b0b

# Jars: Gradle is incremental, so this runs every time and keeps Runtime/ in step with the core.
(cd "$ROOT" && "${GRADLEW:-android/gradlew}" -p "$JVM" installDist zstdStubJar)
rm -rf "$IOS/Runtime" && mkdir -p "$IOS/Runtime"
for jar in "$JVM"/build/install/extension-runtime/lib/*.jar; do
  case "$(basename "$jar")" in okhttp-zstd-* | zstd-kmp-*) ;; *) cp "$jar" "$IOS/Runtime/" ;; esac
done
cp "$JVM/build/libs/zstd-stub.jar" "$JVM/build/install/extension-runtime/boot/jul-shim.jar" "$IOS/Runtime/"

download() { # <file> <sha256>
  if [ -f "$CACHE/$1" ] && echo "$2  $CACHE/$1" | shasum -a 256 -c -s; then return; fi
  curl -fL --retry 3 -o "$CACHE/$1.part" "$RELEASE/$1"
  echo "$2  $CACHE/$1.part" | shasum -a 256 -c -s || { rm -f "$CACHE/$1.part"; echo "SHA-256 mismatch for $1" >&2; exit 1; }
  mv "$CACHE/$1.part" "$CACHE/$1"
}
mkdir -p "$CACHE"
download OpenJDK.xcframework.zip "$JDK_ZIP_SHA"
download java_bundle-device.zip "$BUNDLE_ZIP_SHA"

# The framework only changes with the downloads or these scripts.
STAMP="$(cat "$0" "$IOS/scripts/retag-simulator.py" "$IOS/scripts/jdk-exports.c" "$IOS/scripts/sim-mprotect.c" | shasum -a 256 | cut -d' ' -f1)"
if [ -d "$XCFRAMEWORK" ] && [ "$(cat "$CACHE/framework.stamp" 2>/dev/null)" = "$STAMP" ]; then
  echo "AnipoexJDK.xcframework is up to date"
  exit 0
fi

WORK="$CACHE/build"
rm -rf "$WORK" && mkdir -p "$WORK"
unzip -q "$CACHE/OpenJDK.xcframework.zip" -d "$WORK"
unzip -q "$CACHE/java_bundle-device.zip" -d "$WORK"
JDK="$WORK/OpenJDK.xcframework/ios-arm64"
python3 -I "$IOS/scripts/retag-simulator.py" "$JDK/libdevice.a" "$WORK/libsimulator.a"

framework() { # <slice dir> <sdk> <target> <CFBundleSupportedPlatforms> <static lib> [extra sources]
  out="$WORK/$1/AnipoexJDK.framework" sdk="$2" target="$3" platform="$4" lib="$5"
  shift 5
  mkdir -p "$out/Headers"
  xcrun --sdk "$sdk" clang -target "$target" -dynamiclib -Wl,-all_load "$lib" "$IOS/scripts/jdk-exports.c" "$@" \
    -lz -lc++ -framework Foundation -framework CoreFoundation \
    -Wl,-install_name,@rpath/AnipoexJDK.framework/AnipoexJDK -o "$out/AnipoexJDK"
  cp "$JDK/Headers/jni.h" "$JDK/Headers/jni_md.h" "$out/Headers/"
  # The VM derives java.home from the binary's location: <framework>/lib.
  cp -R "$WORK/java_bundle-device" "$out/lib"
  cat > "$out/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key><string>en</string>
  <key>CFBundleExecutable</key><string>AnipoexJDK</string>
  <key>CFBundleIdentifier</key><string>app.anipoex.jdk</string>
  <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>
  <key>CFBundleName</key><string>AnipoexJDK</string>
  <key>CFBundlePackageType</key><string>FMWK</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleSupportedPlatforms</key><array><string>$platform</string></array>
  <key>CFBundleVersion</key><string>1</string>
  <key>MinimumOSVersion</key><string>16.4</string>
</dict>
</plist>
EOF
}
framework device iphoneos arm64-apple-ios16.4 iPhoneOS "$JDK/libdevice.a"
framework simulator iphonesimulator arm64-apple-ios16.4-simulator iPhoneSimulator "$WORK/libsimulator.a" "$IOS/scripts/sim-mprotect.c"

rm -rf "$XCFRAMEWORK"
xcodebuild -create-xcframework \
  -framework "$WORK/device/AnipoexJDK.framework" \
  -framework "$WORK/simulator/AnipoexJDK.framework" \
  -output "$XCFRAMEWORK"
rm -rf "$WORK"
echo "$STAMP" > "$CACHE/framework.stamp"
