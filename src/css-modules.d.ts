// Ambient CSS modules for TypeScript 7 (noUncheckedSideEffectImports).
declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
