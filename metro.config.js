const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { EXTRA_THEMES } = require("./src/state/theme/constants.ts");

// Windows caps a process at 8192 open files, and a reload read ~8000 cache
// entries at once: Metro hit EMFILE and died.
const MAX_OPEN_CACHE_FILES = 256;

const config = withUniwindConfig(getDefaultConfig(__dirname), {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
  extraThemes: EXTRA_THEMES,
});

config.transformer.uniwindTransformerPath = config.transformerPath;
config.transformerPath = require.resolve("./metro.transformer.js");

let openCacheFiles = 0;
const waiting = [];
const limitOpen =
  (fn) =>
  async (...args) => {
    if (openCacheFiles < MAX_OPEN_CACHE_FILES) openCacheFiles++;
    // A finished call hands its slot straight to the next one.
    else await new Promise((resolve) => waiting.push(resolve));
    try {
      return await fn(...args);
    } finally {
      const next = waiting.shift();
      if (next) next();
      else openCacheFiles--;
    }
  };
config.cacheStores = config.cacheStores.map((store) => ({
  get: limitOpen((key) => store.get(key)),
  set: limitOpen((key, value) => store.set(key, value)),
  clear: () => store.clear(),
}));

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

  // Metro rejects a whole "imports" map, with an "invalid package.json"
  // warning on every lookup, if one target is a package (@base-ui's
  // `#formatErrorMessage`), so such maps are resolved here before it reads them.
  // shortcut: exact keys and browser/import/default only, drop once Metro
  // allows package targets.
  const pkg = moduleName.startsWith("#")
    ? context.getPackageForModule(context.originModulePath)
    : null;
  const imports = pkg?.packageJson.imports;
  let target = imports?.[moduleName];
  if (
    target != null &&
    Object.values(imports).some(
      (t) => typeof t === "string" && !t.startsWith("./"),
    )
  ) {
    while (typeof target === "object")
      target =
        (platform === "web" && target.browser) ||
        target.import ||
        target.default;
    if (typeof target === "string")
      return context.resolveRequest(
        context,
        target.startsWith("./") ? path.join(pkg.rootPath, target) : target,
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
