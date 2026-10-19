#!/bin/sh
# Builds smoke-main.m with JvmHost.m for the simulator and runs it on the booted one; the install case needs SMOKE_APK_URL and SMOKE_SIGNING_KEY.
set -eu

IOS="$(cd "$(dirname "$0")/.." && pwd)"
SLICE="$IOS/Frameworks/AnipoexJDK.xcframework/ios-arm64-simulator"
WORK="$(mktemp -d)"
DATA="$WORK/test data ñ"

xcrun --sdk iphonesimulator clang -target arm64-apple-ios16.4-simulator -fobjc-arc -F "$SLICE" -I "$IOS" \
  "$IOS/scripts/smoke-main.m" "$IOS/JvmHost.m" -framework Foundation -o "$WORK/smoke"

# simctl spawn hands the child only SIMCTL_CHILD_-prefixed variables.
export SIMCTL_CHILD_SMOKE_APK_URL="${SMOKE_APK_URL:-}" SIMCTL_CHILD_SMOKE_SIGNING_KEY="${SMOKE_SIGNING_KEY:-}"
run() { xcrun simctl spawn booted "$WORK/smoke" "$SLICE/AnipoexJDK.framework" "$@" >>"$WORK/out" 2>>"$WORK/err" || true; }
run "$IOS/Runtime" "$DATA" main
pkg="$(sed -n 's/^INSTALLED //p' "$WORK/out")"
if [ -n "$pkg" ]; then run "$IOS/Runtime" "$DATA" relist "$pkg"; fi
run "$WORK/no-jars" "$WORK/no-jars-data" missingJars

# The JDK prints its own noise to stdout too, so only our lines count, wherever they start.
grep -aoE '(PASS|FAIL|SKIP) .*' "$WORK/out" > "$WORK/results" || true
cat "$WORK/results"
failed=0
for name in concurrent installedEmpty utf16RoundTrip missingJars; do grep -qx "PASS $name" "$WORK/results" || failed=1; done
grep -qxE '(PASS|SKIP) install' "$WORK/results" || failed=1
if grep -q '^FAIL' "$WORK/results" || [ "$failed" = 1 ]; then
  echo "smoke failed; output in $WORK" >&2
  exit 1
fi
rm -rf "$WORK"
