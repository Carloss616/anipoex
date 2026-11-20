#!/bin/bash
# Builds build/ipa/anipoex.ipa from the prebuilt ios/ project (pods installed),
# for SideStore and AltStore: they sign it on the device, so no Apple account.
set -euo pipefail
shopt -s nullglob
cd "$(dirname "$0")/../.."

out=build/ipa
xcodebuild -workspace ios/anipoex.xcworkspace -scheme anipoex \
  -configuration Release -destination generic/platform=iOS \
  -derivedDataPath "$out" CODE_SIGNING_ALLOWED=NO build

# SideStore and AltStore read the entitlements from the binaries to register
# the App Group, and an unsigned build carries none: sign ad hoc with them.
app="$out/Build/Products/Release-iphoneos/anipoex.app"
widget="$app/PlugIns/ExpoWidgetsTarget.appex"
for code in "$app"/Frameworks/* "$widget"/Frameworks/*; do
  codesign -f -s - "$code"
done
codesign -f -s - --entitlements ios/ExpoWidgetsTarget/ExpoWidgetsTarget.entitlements "$widget"
codesign -f -s - --entitlements ios/anipoex/anipoex.entitlements "$app"
[[ "$(codesign -d --entitlements - "$app")" == *group.com.anipoex.app* ]]

rm -rf "$out/Payload" "$out/anipoex.ipa"
mkdir "$out/Payload"
cp -R "$app" "$out/Payload/"
(cd "$out" && zip -qry anipoex.ipa Payload)
echo "Built $out/anipoex.ipa"
