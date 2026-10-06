import type { Extension } from "./extension";

/** Test fixtures shared by the `utils` tests. */
export const ext = (
  over: Partial<Extension> & Pick<Extension, "id">,
): Extension => ({
  name: over.id,
  initials: "XX",
  language: "English",
  version: "1.0.0",
  installed: false,
  ...over,
});

export const LIST: Extension[] = [
  ext({ id: "source-c", name: "Source C", language: "Multi", installed: true }),
  ext({
    id: "source-a",
    name: "Source A",
    installed: true,
    latestVersion: "1.1.0",
  }),
  ext({
    id: "source-b",
    name: "Source B",
    language: "Multi",
    installed: true,
    latestVersion: "1.0.1",
  }),
  ext({ id: "source-d", name: "Source D" }),
  ext({ id: "source-e", name: "Source E", language: "Korean" }),
];
