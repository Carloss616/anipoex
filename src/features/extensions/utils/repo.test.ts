import { afterEach, describe, expect, it } from "bun:test";
import { pb } from "./fixtures";
import { fetchIndex, fetchRepo, parseIndex, type Repo, repoUrl } from "./repo";

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
    const { contentWarning: _, ...unspecified } = V2_ENTRY;
    const list = { extensionList: { extensions: [unspecified] } };
    expect(parseIndex(list, "https://b")[0].nsfw).toBe(false);
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

describe("repoUrl", () => {
  it("rewrites github raw urls to raw.githubusercontent.com", () => {
    expect(
      repoUrl("https://github.com/example/extensions/raw/repo/index.pb"),
    ).toBe(`${EXAMPLE}/index.pb`);
  });

  it("keeps a file and points a folder at its repo.json", () => {
    for (const file of ["repo.json", "index.min.json", "index.pb", "a.json"]) {
      expect(repoUrl(` ${EXAMPLE}/${file} `)).toBe(`${EXAMPLE}/${file}`);
    }
    for (const tail of ["", "/", "//"]) {
      expect(repoUrl(`${EXAMPLE}${tail}`)).toBe(`${EXAMPLE}/repo.json`);
    }
    expect(repoUrl("https://example.com")).toBe(
      "https://example.com/repo.json",
    );
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
      if (hit === undefined) return new Response("", { status: 404 });
      // Bun takes bytes as a body; the DOM typings don't list Uint8Array.
      const body = hit instanceof Uint8Array ? hit : JSON.stringify(hit);
      return new Response(body as BodyInit);
    }) as unknown as typeof fetch;
    return urls;
  };

  const legacy = (baseUrl: string): Repo => ({
    baseUrl,
    name: "Example",
    signingKey: EXAMPLE_KEY,
    indexUrl: `${baseUrl}/repo.json`,
    legacy: true,
  });

  const V2_STORE = { name: "Example", signingKey: EXAMPLE_KEY.toUpperCase() };
  const V2 = "https://example.com/v2";

  const PB_SOURCE = [
    ...pb.int(1, 9007199254740993n),
    ...pb.text(2, "Sample"),
    ...pb.text(3, "all"),
  ];
  const PB_EXTENSION = [
    ...pb.text(1, "Sample"),
    ...pb.text(2, "p.sample"),
    ...pb.bytes(3, pb.text(1, "https://example.com/s.apk")),
    ...pb.text(4, "1.4"),
    ...pb.int(5, 3),
    ...pb.text(6, "1.4.3"),
    ...pb.int(7, 1),
    ...pb.bytes(8, PB_SOURCE),
  ];
  const PB_LIST = pb.bytes(1, PB_EXTENSION);
  const PB_ENTRY = {
    pkg: "p.sample",
    name: "Sample",
    version: "1.4.3",
    lib: "1.4",
    apkUrl: "https://example.com/s.apk",
    nsfw: false,
    sources: [{ id: "9007199254740993", name: "Sample", lang: "all" }],
  };
  const pbStore = (...fields: number[][]) =>
    new Uint8Array([
      ...pb.text(1, "Example"),
      ...pb.text(3, EXAMPLE_KEY),
      ...fields.flat(),
    ]);

  it("asks a folder for its repo.json and reads it as a legacy repo", async () => {
    const urls = respond({ [`${EXAMPLE}/repo.json`]: EXAMPLE_META });
    expect(await fetchRepo(`${EXAMPLE}/`)).toEqual(legacy(EXAMPLE));
    expect(urls).toEqual([`${EXAMPLE}/repo.json`]);
  });

  it("reads a v1 index.min.json through its sibling repo.json", async () => {
    const urls = respond({
      [`${EXAMPLE}/index.min.json`]: V1_INDEX,
      [`${EXAMPLE}/repo.json`]: EXAMPLE_META,
    });
    const repo = await fetchRepo(`${EXAMPLE}/index.min.json`);
    expect(repo).toEqual(legacy(EXAMPLE));
    expect(urls).toEqual([`${EXAMPLE}/index.min.json`, `${EXAMPLE}/repo.json`]);

    expect(await fetchIndex(repo)).toEqual(parseIndex(V1_INDEX, EXAMPLE));
    expect(urls.at(-1)).toBe(`${EXAMPLE}/index.min.json`);
  });

  it("refuses a v1 list that isn't at an index.min.json url", async () => {
    respond({ [`${EXAMPLE}/index.json`]: V1_INDEX });
    await expect(fetchRepo(`${EXAMPLE}/index.json`)).rejects.toThrow(
      "Add this repository by its index.min.json URL",
    );
  });

  it("follows index_v2 from a legacy repo.json", async () => {
    const urls = respond({
      [`${EXAMPLE}/repo.json`]: {
        ...EXAMPLE_META,
        index_v2: `${V2}/index.json`,
      },
      [`${V2}/index.json`]: V2_INDEX,
    });
    const repo = await fetchRepo(EXAMPLE);
    expect(repo).toEqual({
      baseUrl: V2,
      name: "Example",
      signingKey: EXAMPLE_KEY,
      indexUrl: `${V2}/index.json`,
      legacy: false,
    });
    expect(urls).toEqual([`${EXAMPLE}/repo.json`, `${V2}/index.json`]);
    expect(await fetchIndex(repo)).toEqual(parseIndex(V2_INDEX, V2));
  });

  it("reads a v2 json store with its list inline", async () => {
    respond({ [`${V2}/index.json`]: V2_INDEX });
    const repo = await fetchRepo(`${V2}/index.json`);
    expect(repo.legacy).toBe(false);
    expect(await fetchIndex(repo)).toHaveLength(3);
  });

  it("follows extensionListUrl in json and in protobuf", async () => {
    respond({
      [`${V2}/index.json`]: {
        ...V2_STORE,
        extensionListUrl: `${V2}/list.json`,
      },
      [`${V2}/list.json`]: V2_INDEX.extensionList,
      [`${V2}/index.pb`]: pbStore(pb.text(102, `${V2}/list.pb`)),
      [`${V2}/list.pb`]: new Uint8Array(PB_LIST),
    });
    const json = await fetchRepo(`${V2}/index.json`);
    expect(json.extensionListUrl).toBe(`${V2}/list.json`);
    expect(json.signingKey).toBe(EXAMPLE_KEY);
    expect(await fetchIndex(json)).toHaveLength(3);

    const proto = await fetchRepo(`${V2}/index.pb`);
    expect(proto.extensionListUrl).toBe(`${V2}/list.pb`);
    expect(await fetchIndex(proto)).toEqual([PB_ENTRY]);
  });

  it("reads a protobuf store, gzipped or not, with exact source ids", async () => {
    const store = pbStore(pb.bytes(101, PB_LIST));
    respond({
      [`${V2}/index.pb`]: store,
      [`${V2}/index.gz.pb`]: Bun.gzipSync(store),
    });
    for (const file of ["index.pb", "index.gz.pb"]) {
      const repo = await fetchRepo(`${V2}/${file}`);
      expect(repo).toEqual({
        baseUrl: V2,
        name: "Example",
        signingKey: EXAMPLE_KEY,
        indexUrl: `${V2}/${file}`,
        legacy: false,
      });
      expect(await fetchIndex(repo)).toEqual([PB_ENTRY]);
    }
  });

  it("rejects what isn't a repository", async () => {
    respond({
      [`${V2}/a.json`]: { meta: { name: "x" } },
      [`${V2}/b.json`]: { name: "x" },
      [`${V2}/c.pb`]: new Uint8Array(pb.text(1, "x")),
      [`${V2}/d.html`]: new TextEncoder().encode("<html></html>"),
      [`${V2}/e.json`]: new Uint8Array(),
    });
    for (const file of ["a.json", "b.json", "c.pb", "d.html", "e.json"]) {
      await expect(fetchRepo(`${V2}/${file}`)).rejects.toThrow(
        "This isn't an extension repository",
      );
    }
  });

  it("rejects a 404 with the url it read", async () => {
    respond({});
    await expect(fetchRepo(EXAMPLE)).rejects.toThrow(
      `Couldn't read ${EXAMPLE}/repo.json (404)`,
    );
  });

  it("refuses a url that isn't https without fetching it", async () => {
    const urls = respond({
      "http://example.com/repo/repo.json": EXAMPLE_META,
      [`${EXAMPLE}/repo.json`]: {
        ...EXAMPLE_META,
        index_v2: "http://example.com/v2/index.pb",
      },
    });
    await expect(fetchRepo("http://example.com/repo")).rejects.toThrow(
      "Repository URLs must use https",
    );
    expect(urls).toEqual([]);
    await expect(fetchRepo(EXAMPLE)).rejects.toThrow(
      "Repository URLs must use https",
    );
  });

  it("stops a repo.json that keeps pointing at itself", async () => {
    respond({
      [`${EXAMPLE}/repo.json`]: {
        ...EXAMPLE_META,
        index_v2: `${EXAMPLE}/repo.json`,
      },
    });
    await expect(fetchRepo(EXAMPLE)).rejects.toThrow(
      "This isn't an extension repository",
    );
  });
});
