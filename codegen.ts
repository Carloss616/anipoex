import type { CodegenConfig } from "@graphql-codegen/cli";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local", override: true });

const config: CodegenConfig = {
  schema: [
    process.env.EXPO_PUBLIC_ANILIST_GRAPHQL_URL as string,
    "src/graphql/directives.graphql",
  ],
  documents: "src/**/*.gql",
  ignoreNoDocuments: true,
  generates: {
    "src/graphql/types.generated.ts": {
      plugins: ["typescript"],
    },
    "src/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.tsx",
        baseTypesPath: "~@/graphql/types.generated",
      },
      plugins: ["typescript-operations", "typed-document-node"],
      config: {
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["bun run check:fix"],
  },
};

export default config;
