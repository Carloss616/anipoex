import { describe, expect, it } from "bun:test";
import { MediaListStatus, MediaStatus } from "@/graphql/types.generated";
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
  it("returns null when there is no media", () => {
    expect(toDetail(7, null)).toBeNull();
  });

  it("keeps the list fields and defaults the detail ones", () => {
    expect(toDetail(7, media())).toMatchObject({
      id: "7",
      title: "Berserk",
      synopsis: "",
      publicationStatus: null,
      author: null,
    });
  });

  it("maps the partial media the list cached, with the detail keys absent", () => {
    // What `useFragment` hands back before the detail fetch lands: the list's
    // half of the fragment, with the rest of the keys simply missing.
    const partial = {
      title: { userPreferred: "Berserk" },
      coverImage: { large: "https://img/berserk.jpg" },
      genres: ["Action"],
      chapters: 374,
    } as MangaDetailFragment;

    expect(toDetail(30002, partial)).toMatchObject({
      id: "30002",
      title: "Berserk",
      cover: "https://img/berserk.jpg",
      genres: ["Action"],
      chapters: 374,
      progress: 0,
      synopsis: "",
      author: null,
      publicationStatus: null,
    });
  });

  it("reads the score and list status the list fragment doesn't select", () => {
    const detail = toDetail(
      7,
      media({
        mediaListEntry: {
          id: 1,
          status: MediaListStatus.Current,
          score: 9,
        },
      } as Partial<MangaDetailFragment>),
    );

    expect(detail).toMatchObject({
      score: 9,
      listStatus: MediaListStatus.Current,
    });
  });

  it("carries the publication status, which is not the list status", () => {
    const detail = toDetail(7, media({ status: MediaStatus.Releasing }));

    expect(detail?.publicationStatus).toBe(MediaStatus.Releasing);
    expect(detail?.listStatus).toBeNull();
  });

  describe("synopsis", () => {
    it("turns <br> into newlines and drops the rest of the markup", () => {
      const detail = toDetail(
        7,
        media({ description: "A <i>dark</i> epic.<br><br>Guts <b>walks</b>." }),
      );

      expect(detail?.synopsis).toBe("A dark epic.\n\nGuts walks.");
    });

    it("decodes the entities AniList actually emits", () => {
      const detail = toDetail(
        7,
        media({ description: "Rock &amp; Roll &quot;Mad&quot; &#039;90s" }),
      );

      expect(detail?.synopsis).toBe(`Rock & Roll "Mad" '90s`);
    });

    it("collapses runs of blank lines and trims", () => {
      const detail = toDetail(
        7,
        media({ description: "<br>One.<br><br><br><br>Two.<br>" }),
      );

      expect(detail?.synopsis).toBe("One.\n\nTwo.");
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

      expect(detail?.author).toBe("Kentaro Miura");
    });

    it("matches the combined credit too", () => {
      const detail = toDetail(
        7,
        media({ staff: staffOf([{ role: "Story & Art", full: "Miura" }]) }),
      );

      expect(detail?.author).toBe("Miura");
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

      expect(detail?.author).toBe("First");
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

      expect(detail?.author).toBeNull();
    });
  });
});
