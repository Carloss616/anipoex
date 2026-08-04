const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = withUniwindConfig(getDefaultConfig(__dirname), {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});

// @legendapp/list's "browser" export is a DOM build that renders raw <div>s: it
// can't read react-native-web style arrays or $$css objects, which is exactly
// what uniwind hands it. Resolve the react-native build on web too.
const resolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
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
