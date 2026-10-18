const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { EXTRA_THEMES } = require("./src/state/theme/constants.ts");

const config = withUniwindConfig(getDefaultConfig(__dirname), {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
  extraThemes: EXTRA_THEMES,
});

const resolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // tslib resolves to an .mjs with no default export, which breaks rxjs (an
  // @apollo/client dep) in the static web render. "require" picks the CJS build.
  if (moduleName === "tslib") {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ["require"],
        unstable_conditionsByPlatform: {},
      },
      moduleName,
      platform,
    );
  }

  // Uniwind swaps "react-native" for its component shim, which lacks
  // AssetRegistry; expo-asset reads it, so useFonts never resolves.
  // shortcut: drop once a uniwind release ships uni-stack/uniwind#740.
  if (
    moduleName === "react-native" &&
    context.originModulePath.includes(`${path.sep}expo-asset${path.sep}`)
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }

  // Uniwind's web InputAccessoryView wrapper reads `ReactNative.InputAccessoryView`
  // at module load, while RNW's index (which imports it) is still evaluating, so
  // the static web render sees ReactNative undefined. On web RNW renders it as a
  // plain view, so this one export skips the wrapper.
  // shortcut: no className on InputAccessoryView on web, drop once Uniwind's
  // wrapper stops reading the react-native namespace at load.
  if (
    platform === "web" &&
    moduleName === "./exports/InputAccessoryView" &&
    context.originModulePath.endsWith(
      `${path.sep}react-native-web${path.sep}dist${path.sep}index.js`,
    )
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return (resolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
