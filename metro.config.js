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

  return (resolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
