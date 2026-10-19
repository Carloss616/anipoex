import { afterEach, describe, expect, it } from "bun:test";
import {
  fetchIndex,
  fetchRepo,
  parseIndex,
  parseRepoMeta,
  repoBaseUrl,
} from "./repo";

const EXAMPLE = "https://raw.githubusercontent.com/example/extensions/repo";
const EXAMPLE_KEY = "a".repeat(64);

const EXAMPLE_META = {
  meta: {
    name: "Example",
    shortName: "Example",
    website: "https://example.com/",
    signingKeyFingerprint: EXAMPLE_KEY,
  },
};

const V1_INDEX = [
  {
    name: "Tachiyomi: Example",
    pkg: "eu.kanade.tachiyomi.extension.all.example",
    apk: "tachiyomi-all.example-v1.4.26.apk",
    lang: "all",
    code: 26,
    version: "1.4.26",
    nsfw: 0,
    sources: [
      {
        name: "Example (1)",
        lang: "all",
        id: "1234567890123456789",
        baseUrl: "",
      },
    ],
  },
];

const V2_ENTRY = {
  name: "Sample",
  packageName: "eu.kanade.tachiyomi.extension.all.sample",
  resources: {
    apkUrl: "https://example.com/releases/tachiyomi-all.sample-v1.6.4.apk",
    iconUrl: "https://example.com/ic.png",
    jarUrl: "https://example.com/releases/a.jar",
  },
  extensionLib: "1.6",
  versionCode: "106004",
  versionName: "1.6.4",
  contentWarning: "CONTENT_WARNING_NSFW",
  sources: [
    {
      id: "6289731484943315811",
      name: "Sample",
      language: "all",
      homeUrl: "x",
    },
  ],
};

const V2_INDEX = {
  name: "Example",
  signingKey: "a".repeat(64),
  extensionList: {
    extensions: [
      V2_ENTRY,
      {
        ...V2_ENTRY,
        packageName: "p.safe",
        contentWarning: "CONTENT_WARNING_SAFE",
      },
      {
        ...V2_ENTRY,
        packageName: "p.mixed",
        contentWarning: "CONTENT_WARNING_MIXED",
      },
      { name: "Broken", packageName: "p.broken" },
    ],
  },
};

describe("repoBaseUrl", () => {
  it("rewrites github raw urls to raw.githubusercontent.com", () => {
    expect(
      repoBaseUrl("https://github.com/example/extensions/raw/repo/index.pb"),
    ).toBe(EXAMPLE);
  });

  it("keeps refs/heads branches", () => {
    expect(
      repoBaseUrl(
        "https://raw.githubusercontent.com/example/extensions/refs/heads/repo/index.pb",
      ),
    ).toBe(
      "https://raw.githubusercontent.com/example/extensions/refs/heads/repo",
    );
  });

  it("strips repo files and trailing slashes", () => {
    for (const tail of [
      "/repo.json",
      "/index.min.json",
      "/index.json",
      "/",
      "",
    ]) {
      expect(repoBaseUrl(`${EXAMPLE}${tail}`)).toBe(EXAMPLE);
    }
  });
});

describe("parseRepoMeta", () => {
  it("reads name and signing key", () => {
    expect(parseRepoMeta(EXAMPLE_META, EXAMPLE)).toEqual({
      baseUrl: EXAMPLE,
      name: "Example",
      signingKey: EXAMPLE_KEY,
    });
  });

  it("lowercases and trims the signing key", () => {
    const json = { meta: { name: "K", signingKeyFingerprint: " ABCDEF12 " } };
    expect(parseRepoMeta(json, EXAMPLE).signingKey).toBe("abcdef12");
  });

  it("throws when meta is missing", () => {
    expect(() => parseRepoMeta({}, EXAMPLE)).toThrow(
      "This repository has no repo.json",
    );
    expect(() => parseRepoMeta({ meta: { name: "x" } }, EXAMPLE)).toThrow(
      "This repository has no repo.json",
    );
  });
});

describe("parseIndex", () => {
  it("normalizes the v2 format and skips malformed entries", () => {
    const [nsfw, safe, mixed, ...rest] = parseIndex(V2_INDEX, "https://b");
    expect(rest).toEqual([]);
    expect(nsfw).toEqual({
      pkg: V2_ENTRY.packageName,
      name: "Sample",
      version: "1.6.4",
      lib: "1.6",
      apkUrl: V2_ENTRY.resources.apkUrl,
      iconUrl: "https://example.com/ic.png",
      nsfw: true,
      sources: [{ id: "6289731484943315811", name: "Sample", lang: "all" }],
    });
    expect(safe.nsfw).toBe(false);
    expect(mixed.nsfw).toBe(true);
  });

  it("normalizes the v1 format", () => {
    expect(parseIndex(V1_INDEX, EXAMPLE)).toEqual([
      {
        pkg: "eu.kanade.tachiyomi.extension.all.example",
        name: "Tachiyomi: Example",
        version: "1.4.26",
        lib: "1.4",
        apkUrl: `${EXAMPLE}/apk/tachiyomi-all.example-v1.4.26.apk`,
        iconUrl: `${EXAMPLE}/icon/eu.kanade.tachiyomi.extension.all.example.png`,
        nsfw: false,
        sources: [
          { id: "1234567890123456789", name: "Example (1)", lang: "all" },
        ],
      },
    ]);
    expect(parseIndex([{ ...V1_INDEX[0], nsfw: 1 }], EXAMPLE)[0].nsfw).toBe(
      true,
    );
  });

  it("returns nothing for an unknown shape", () => {
    expect(parseIndex("nope", EXAMPLE)).toEqual([]);
    expect(parseIndex({}, EXAMPLE)).toEqual([]);
  });
});

describe("fetch", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  const respond = (routes: Record<string, unknown>) => {
    const urls: string[] = [];
    globalThis.fetch = (async (url: string) => {
      urls.push(url);
      const hit = routes[url];
      return hit === undefined
        ? new Response("", { status: 404 })
        : new Response(JSON.stringify(hit));
    }) as unknown as typeof fetch;
    return urls;
  };

  it("fetchRepo reads repo.json from the normalized base", async () => {
    respond({ [`${EXAMPLE}/repo.json`]: EXAMPLE_META });
    expect((await fetchRepo(`${EXAMPLE}/index.min.json`)).name).toBe("Example");
  });

  it("fetchRepo rejects when repo.json is a 404", async () => {
    respond({});
    await expect(fetchRepo(EXAMPLE)).rejects.toThrow(
      "This repository has no repo.json",
    );
  });

  it("fetchRepo refuses a url that isn't https without fetching it", async () => {
    const urls = respond({
      "http://example.com/repo/repo.json": EXAMPLE_META,
    });
    await expect(fetchRepo("http://example.com/repo")).rejects.toThrow(
      "Repository URLs must use https",
    );
    expect(urls).toEqual([]);
  });

  it("fetchIndex falls back to index.min.json on a 404", async () => {
    const urls = respond({ [`${EXAMPLE}/index.min.json`]: V1_INDEX });
    const repo = { baseUrl: EXAMPLE, name: "K", signingKey: EXAMPLE_KEY };
    expect(await fetchIndex(repo)).toHaveLength(1);
    expect(urls).toEqual([
      `${EXAMPLE}/index.json`,
      `${EXAMPLE}/index.min.json`,
    ]);
  });
});
