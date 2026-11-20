import { expect, test } from "bun:test";
import { parseNotes } from "./release-notes";

test("reads git-cliff's headings and scoped bullets", () => {
  const notes = `
### Features

- **manga**: Refresh the whole list on open
- Native @expo/ui primitive kit
`;
  expect(parseNotes(notes)).toEqual([
    { kind: "heading", spans: [{ text: "Features" }] },
    {
      kind: "bullet",
      spans: [
        { text: "manga", bold: true },
        { text: ": Refresh the whole list on open" },
      ],
    },
    { kind: "bullet", spans: [{ text: "Native @expo/ui primitive kit" }] },
  ]);
});

test("keeps a link's text and drops code marks", () => {
  expect(
    parseNotes("See [the docs](https://example.com) for `bun test`"),
  ).toEqual([
    { kind: "paragraph", spans: [{ text: "See the docs for bun test" }] },
  ]);
});

test("an unclosed bold mark stays as text", () => {
  expect(parseNotes("* **half bold")).toEqual([
    { kind: "bullet", spans: [{ text: "**half bold" }] },
  ]);
});
