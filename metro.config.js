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

  // @legendapp/list's "browser" build renders raw <div>s that can't read the
  // styles uniwind hands it. Force the react-native build on web.
  if (platform === "web" && moduleName.startsWith("@legendapp/list")) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ["react-native", "require"],
        unstable_conditionsByPlatform: {},
      },
      moduleName,
      platform,
    );
  }

  return (resolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
