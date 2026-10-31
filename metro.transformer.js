const path = require("node:path");

const ENTRY = path.join("src", "global.css");
const NATIVE_ENTRY = path.join("src", "global.base.css");

/**
 * Uniwind's transformer, with iOS and Android compiling `global.base.css`:
 * `global.css` adds web-only styles and scans panelui-web, whose calc()s
 * native styles can't hold. Uniwind reads its entry from disk and matches
 * it by `cssEntryFile`, so both point at the native file here.
 */
module.exports.transform = (config, projectRoot, filePath, data, options) => {
  const { transform } = require(config.uniwindTransformerPath);
  if (options.platform === "web" || path.normalize(filePath) !== ENTRY) {
    return transform(config, projectRoot, filePath, data, options);
  }
  return transform(
    {
      ...config,
      uniwind: { ...config.uniwind, cssEntryFile: `./${NATIVE_ENTRY}` },
    },
    projectRoot,
    NATIVE_ENTRY,
    data,
    options,
  );
};
