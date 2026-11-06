import { describe, expect, test } from "bun:test";
import type { HomeSectionsQuery } from "../graphql/home-sections.generated";
import {
  sectionActivities,
  sectionGenres,
  sectionMedia,
  sectionTitle,
} from "./section-data";

const media = (id: number) => ({ __typename: "Media" as const, id }) as never;

const data = {
  trending: { __typename: "Page", media: [media(1), null, media(2)] },
  planning: {
    __typename: "Page",
    mediaList: [
      { id: 9, media: media(3) },
      { id: 10, media: null },
    ],
  },
  because: {
    __typename: "Page",
    mediaList: [
      {
        id: 11,
        media: {
          id: 4,
          title: { userPreferred: "Dungeon Meshi" },
          recommendations: {
            nodes: [
              { id: 1, mediaRecommendation: media(5) },
              { id: 2, mediaRecommendation: null },
              {
                id: 3,
                mediaRecommendation: {
                  __typename: "Media",
                  id: 6,
                  mediaListEntry: { id: 12, status: "COMPLETED" },
                },
              },
              {
                id: 4,
                mediaRecommendation: {
                  __typename: "Media",
                  id: 7,
                  mediaListEntry: { id: 13, status: "CURRENT" },
                },
              },
            ],
          },
        },
      },
    ],
  },
  following: {
    __typename: "Page",
    activities: [
      { __typename: "ListActivity", id: 7, user: { id: 1 } },
      { __typename: "ListActivity", id: 8, user: { id: 42 } },
      { __typename: "TextActivity" },
      null,
    ],
  },
  genres: ["Action", null, "Hentai", "Drama"],
} as unknown as HomeSectionsQuery;

const ids = (list: { id: number }[]) => list.map((m) => m.id);

describe("sectionMedia", () => {
  test("a Page section skips missing media", () => {
    expect(ids(sectionMedia(data, "trending"))).toEqual([1, 2]);
  });

  test("Planning takes its list entries' media", () => {
    expect(ids(sectionMedia(data, "planning"))).toEqual([3]);
  });

  test("Because takes the recommendations not completed yet", () => {
    expect(ids(sectionMedia(data, "because"))).toEqual([5, 7]);
  });

  test("a section not loaded is empty", () => {
    expect(sectionMedia(data, "top")).toEqual([]);
    expect(sectionMedia(undefined, "trending")).toEqual([]);
  });
});

describe("sectionActivities", () => {
  test("keeps list activities only", () => {
    expect(sectionActivities(data, "following").map((a) => a.id)).toEqual([
      7, 8,
    ]);
  });

  test("leaves out the viewer's own", () => {
    expect(sectionActivities(data, "following", 42).map((a) => a.id)).toEqual([
      7,
    ]);
  });
});

describe("sectionGenres", () => {
  test("skips missing and adult genres", () => {
    expect(sectionGenres(data)).toEqual(["Action", "Drama"]);
  });
});

describe("sectionTitle", () => {
  test("names the manga Because is about", () => {
    expect(sectionTitle(data, "because")).toBe(
      "Because you read Dungeon Meshi",
    );
  });

  test("falls back to the section's title", () => {
    expect(sectionTitle(undefined, "because")).toBe("Because you read …");
    expect(sectionTitle(data, "trending")).toBe("Trending now");
  });
});
