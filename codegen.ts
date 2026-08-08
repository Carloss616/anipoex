import type { CodegenConfig } from "@graphql-codegen/cli";
import type { PluginFunction } from "@graphql-codegen/plugin-helpers";
import {
  ReactQueryVisitor,
  plugin as reactQuery,
} from "@graphql-codegen/typescript-react-query";
import { typedDocumentString } from "@graphql-codegen/visitor-plugin-common";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local", override: true });

// biome-ignore lint/suspicious/noExplicitAny: typed-document-node workaround
(ReactQueryVisitor.prototype as any).getDocumentNodeSignature = (
  resultType: string,
  variablesTypes: string,
) => ` as unknown as TypedDocumentString<${resultType}, ${variablesTypes}>`;

const sharedReactQuery: PluginFunction = async (...args) => {
  const out = await reactQuery(...args);
  if (typeof out === "string" || !out.content) return out;

  return {
    ...out,
    prepend: [
      ...(out.prepend ?? []).filter(
        (line) => !line.includes(typedDocumentString.import.moduleName),
      ),
      'import { TypedDocumentString } from "@/graphql/graphql";\n',
    ],
    content: out.content.replace(typedDocumentString.template, ""),
  };
};

const config: CodegenConfig = {
  schema: process.env.EXPO_PUBLIC_ANILIST_GRAPHQL_URL,
  documents: "src/**/*.gql",
  ignoreNoDocuments: true,
  generates: {
    "src/graphql/graphql.ts": {
      plugins: [
        {
          add: {
            content: `import type { ${typedDocumentString.import.propName} } from "${typedDocumentString.import.moduleName}";\n`,
          },
        },
        { add: { placement: "append", content: typedDocumentString.template } },
      ],
    },
    "src/graphql/types.ts": {
      plugins: ["typescript"],
    },
    "src/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.tsx",
        baseTypesPath: "~@/graphql/types",
      },
      plugins: ["typescript-operations", "typescript-react-query"],
      config: {
        reactQueryVersion: 5,
        documentMode: "string",
        fetcher: "@/graphql/fetcher#fetcher",
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
  pluginLoader: (name) =>
    name.includes("typescript-react-query")
      ? { plugin: sharedReactQuery }
      : import(name),
  hooks: {
    afterAllFileWrite: ["bun run check:fix"],
  },
};

export default config;
