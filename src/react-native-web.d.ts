// Internal module with no types: icon.tsx makes a glyph a span with it.
// shortcut: no public export yet; switch when one lands
// (https://github.com/react-native-community/discussions-and-proposals/issues/495).
declare module "react-native-web/dist/exports/Text/TextAncestorContext" {
  const TextAncestorContext: import("react").Context<boolean>;
  export default TextAncestorContext;
}
