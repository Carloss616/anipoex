#!/bin/bash
# Builds ios/dist/anipoex.ipa from the prebuilt ios/ project (pods installed),
# for SideStore and AltStore: they sign it on the device, so no Apple account.
set -euo pipefail
shopt -s nullglob
cd "$(dirname "$0")/../.."

xcodebuild -workspace ios/anipoex.xcworkspace -scheme anipoex \
  -configuration Release -destination generic/platform=iOS \
  -derivedDataPath ios/build/derived CODE_SIGNING_ALLOWED=NO build

# SideStore and AltStore read the entitlements from the binaries to register
# the App Group, and an unsigned build carries none: sign ad hoc with them.
app=ios/build/derived/Build/Products/Release-iphoneos/anipoex.app
widget="$app/PlugIns/ExpoWidgetsTarget.appex"
for code in "$app"/Frameworks/* "$widget"/Frameworks/*; do
  codesign -f -s - "$code"
done
codesign -f -s - --entitlements ios/ExpoWidgetsTarget/ExpoWidgetsTarget.entitlements "$widget"
codesign -f -s - --entitlements ios/anipoex/anipoex.entitlements "$app"
[[ "$(codesign -d --entitlements - "$app")" == *group.com.anipoex.app* ]]

rm -rf ios/build/Payload ios/dist/anipoex.ipa
mkdir -p ios/build/Payload ios/dist
cp -R "$app" ios/build/Payload/
(cd ios/build && zip -qry ../dist/anipoex.ipa Payload)
echo "Built ios/dist/anipoex.ipa"
