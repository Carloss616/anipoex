import { expect, test } from "bun:test";
import { coverHeaders } from "./covers.js";

const HEADERS = { Referer: "https://site.test/", Origin: "https://site.test" };
const installed = [{ sources: [{ id: "1", headers: HEADERS }] }];
const page = (thumbnailUrl) => ({ mangas: [{ thumbnailUrl }] });

test("addsTheSourceHeadersToItsCoverHost", () => {
  const covers = coverHeaders();
  covers.learnSources(installed);
  covers.learnCovers("1", page("https://img.test/a.webp"));
  expect(
    covers.apply("https://img.test/b.webp", { Accept: "image/*" }),
  ).toEqual({
    Accept: "image/*",
    Referer: "https://site.test/",
  });
});

test("leavesOtherHostsAlone", () => {
  const covers = coverHeaders();
  covers.learnSources(installed);
  covers.learnCovers("1", page("https://img.test/a.webp"));
  const headers = { Accept: "image/*" };
  expect(covers.apply("https://other.test/a.webp", headers)).toBe(headers);
});

test("ignoresUnknownSourcesAndNonWebUrls", () => {
  const covers = coverHeaders();
  covers.learnSources(installed);
  covers.learnCovers("2", page("https://img.test/a.webp"));
  covers.learnCovers("1", page("data:image/png;base64,AAAA"));
  covers.learnCovers("1", page(null));
  const headers = {};
  expect(covers.apply("https://img.test/a.webp", headers)).toBe(headers);
});
