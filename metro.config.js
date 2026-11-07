const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { EXTRA_THEMES } = require("./src/state/theme/constants.ts");

const config = withUniwindConfig(getDefaultConfig(__dirname), {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
  extraThemes: EXTRA_THEMES,
});

config.transformer.uniwindTransformerPath = config.transformerPath;
config.transformerPath = require.resolve("./metro.transformer.js");

const resolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // tslib resolves to an .mjs with no default export, which breaks rxjs (an
  // @apollo/client dep) in the static web render; "require" picks the CJS.
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

  try {
    return (resolveRequest ?? context.resolveRequest)(
      context,
      moduleName,
      platform,
    );
  } catch (error) {
    // Metro drops a whole "imports" map if a target is a package (@base-ui).
    // shortcut: browser/import/default only, drop once Metro allows that.
    const pkg = moduleName.startsWith("#")
      ? context.getPackageForModule(context.originModulePath)
      : null;
    let target = pkg?.packageJson.imports?.[moduleName];
    if (target == null) throw error;
    while (typeof target === "object")
      target =
        (platform === "web" && target.browser) ||
        target.import ||
        target.default;
    if (typeof target !== "string") throw error;
    return context.resolveRequest(
      context,
      target.startsWith("./") ? path.join(pkg.rootPath, target) : target,
      platform,
    );
  }
};

module.exports = config;
