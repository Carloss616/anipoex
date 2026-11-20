export interface Span {
  text: string;
  bold?: boolean;
}

export interface Block {
  kind: "heading" | "bullet" | "paragraph";
  spans: Span[];
}

/** Bold runs split out; links keep their text, code its characters. */
function spansOf(text: string): Span[] {
  const plain = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/`/g, "");
  // The capture group puts the bold runs at the odd indexes.
  return plain
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => (i % 2 ? { text: part, bold: true } : { text: part }))
    .filter((span) => span.text);
}

/**
 * The Markdown release notes use (headings, bullets, bold), one block per
 * line. Anything else shows as its plain text.
 */
export function parseNotes(markdown: string): Block[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const heading = /^#{1,6}\s+(.*)$/.exec(line);
      if (heading) return { kind: "heading", spans: spansOf(heading[1]) };
      const bullet = /^[-*+]\s+(.*)$/.exec(line);
      if (bullet) return { kind: "bullet", spans: spansOf(bullet[1]) };
      return { kind: "paragraph", spans: spansOf(line) };
    });
}
