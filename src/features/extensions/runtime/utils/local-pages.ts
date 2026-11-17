import type { SourcePage } from "../runtime";

export type FilePage = { index: number; uri: string };

/** An unpacked chapter's files as reader pages. */
export const localPages = (pages: FilePage[]) =>
  pages.map(
    (page): SourcePage => ({
      index: page.index,
      imageUrl: page.uri,
      headers: {},
      local: true,
    }),
  );
