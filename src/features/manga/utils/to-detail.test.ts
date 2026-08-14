import { describe, expect, it } from "bun:test";
import { MediaStatus } from "@/graphql/types.generated";
import type { MangaDetailFragment } from "../graphql/manga-fragments.generated";
import { toDetail } from "./to-detail";

const media = (over: Partial<MangaDetailFragment> = {}) =>
  ({
    title: { userPreferred: "Berserk" },
    coverImage: null,
    startDate: null,
    genres: null,
    chapters: null,
    mediaListEntry: null,
    description: null,
    status: null,
    staff: null,
    ...over,
  }) as MangaDetailFragment;

const staffOf = (edges: { role: string | null; full: string }[]) =>
  ({
    edges: edges.map(({ role, full }) => ({ role, node: { name: { full } } })),
  }) as MangaDetailFragment["staff"];

describe("toDetail", () => {
  it("keeps the media fields and stamps the id", () => {
    expect(toDetail(7, media({ status: MediaStatus.Releasing }))).toMatchObject(
      {
        id: 7,
        title: { userPreferred: "Berserk" },
        status: MediaStatus.Releasing,
      },
    );
  });

  it("passes through the partial media the list cached", () => {
    // What `useFragment` hands back before the detail fetch lands: the list's
    // half of the fragment, with the rest of the keys simply missing.
    const partial = {
      title: { userPreferred: "Berserk" },
      coverImage: { large: "https://img/berserk.jpg" },
      genres: ["Action"],
      chapters: 374,
    } as MangaDetailFragment;

    expect(toDetail(30002, partial)).toEqual({
      id: 30002,
      title: { userPreferred: "Berserk" },
      coverImage: { large: "https://img/berserk.jpg" },
      genres: ["Action"],
      chapters: 374,
      description: undefined,
      author: undefined,
    });
  });

  describe("description", () => {
    it("turns <br> into newlines and drops the rest of the markup", () => {
      const detail = toDetail(
        7,
        media({ description: "A <i>dark</i> epic.<br><br>Guts <b>walks</b>." }),
      );

      expect(detail.description).toBe("A dark epic.\n\nGuts walks.");
    });

    it("decodes the entities AniList actually emits", () => {
      const detail = toDetail(
        7,
        media({ description: "Rock &amp; Roll &quot;Mad&quot; &#039;90s" }),
      );

      expect(detail.description).toBe(`Rock & Roll "Mad" '90s`);
    });

    it("collapses runs of blank lines and trims", () => {
      const detail = toDetail(
        7,
        media({ description: "<br>One.<br><br><br><br>Two.<br>" }),
      );

      expect(detail.description).toBe("One.\n\nTwo.");
    });
  });

  describe("author", () => {
    it("prefers the story credit over a higher-billed artist", () => {
      const detail = toDetail(
        7,
        media({
          staff: staffOf([
            { role: "Art", full: "Studio Gaga" },
            { role: "Story", full: "Kentaro Miura" },
          ]),
        }),
      );

      expect(detail.author).toBe("Kentaro Miura");
    });

    it("matches the combined credit too", () => {
      const detail = toDetail(
        7,
        media({ staff: staffOf([{ role: "Story & Art", full: "Miura" }]) }),
      );

      expect(detail.author).toBe("Miura");
    });

    it("falls back to the top-billed name when no role mentions story", () => {
      const detail = toDetail(
        7,
        media({
          staff: staffOf([
            { role: "Assistant", full: "First" },
            { role: null, full: "Second" },
          ]),
        }),
      );

      expect(detail.author).toBe("First");
    });

    it("skips edges with no name instead of billing an empty author", () => {
      const detail = toDetail(
        7,
        media({
          staff: {
            edges: [{ role: "Story", node: null }, null],
          } as MangaDetailFragment["staff"],
        }),
      );

      expect(detail.author).toBeUndefined();
    });
  });
});
