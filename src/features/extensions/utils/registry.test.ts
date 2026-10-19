import { describe, expect, it } from "bun:test";
import { initialsOf } from "@/features/manga/sources";
import type { InstalledExtension } from "../runtime/runtime";
import { languageName, toExtensions } from "./registry";
import type { Repo, RepoEntry } from "./repo";

const REPO_A: Repo = {
  baseUrl: "https://example.com/a",
  name: "Example",
  signingKey: "a-key",
  indexUrl: "https://example.com/a/repo.json",
  legacy: true,
};
const REPO_B: Repo = {
  baseUrl: "https://example.com/b",
  name: "Other",
  signingKey: "b-key",
  indexUrl: "https://example.com/b/repo.json",
  legacy: true,
};

const entry = (over: Partial<RepoEntry> = {}): RepoEntry => ({
  pkg: "eu.kanade.tachiyomi.extension.en.foo",
  name: "Foo",
  version: "1.6.2",
  lib: "1.4",
  apkUrl: "https://example.com/a/foo.apk",
  nsfw: false,
  sources: [{ id: "1", name: "Foo", lang: "en" }],
  ...over,
});

const inst = (over: Partial<InstalledExtension> = {}): InstalledExtension => ({
  pkg: "eu.kanade.tachiyomi.extension.en.foo",
  name: "Foo",
  version: "1.6.0",
  lib: 14,
  signingKey: "a-key",
  sources: [{ id: "1", name: "Foo", lang: "en", homeUrl: null }],
  icon: null,
  ...over,
});

describe("initialsOf", () => {
  it("takes the capitals, or the first letters of two words", () => {
    expect(initialsOf("ExampleSource")).toBe("ES");
    expect(initialsOf("Example Scans")).toBe("ES");
    expect(initialsOf("ExampleX")).toBe("EX");
    expect(initialsOf("Example")).toBe("EX");
  });

  it("gives nothing for an empty name", () => {
    expect(initialsOf("")).toBe("");
  });
});

describe("languageName", () => {
  it("names a code, and folds all/mul into Multi", () => {
    expect(languageName("en")).toBe("English");
    expect(languageName("all")).toBe("Multi");
    expect(languageName("mul")).toBe("Multi");
  });
});

describe("toExtensions", () => {
  it("names an installed build without a name after its package", () => {
    const [unnamed] = toExtensions(
      [],
      [inst({ name: null as unknown as string })],
    );
    expect(unnamed.name).toBe("eu.kanade.tachiyomi.extension.en.foo");
    expect(unnamed.initials).toBe("EU");
    expect(toExtensions([], [inst({ name: "" })])[0].name).toBe(
      "eu.kanade.tachiyomi.extension.en.foo",
    );
  });

  it("derives the language from the sources", () => {
    const sources = (...langs: string[]) =>
      langs.map((lang, i) => ({ id: `${i}`, name: "S", lang }));
    const lang = (...langs: string[]) =>
      toExtensions(
        [{ repo: REPO_A, entries: [entry({ sources: sources(...langs) })] }],
        [],
      )[0].language;
    expect(lang("en", "es").code).toBe("mul");
    expect(lang("all").code).toBe("mul");
    expect(lang("ko")).toEqual({ code: "ko", name: "Korean" });
  });

  it("lists only API 1.4 and 1.6", () => {
    const at = (lib: string) =>
      toExtensions([{ repo: REPO_A, entries: [entry({ lib })] }], []).length;
    expect(at("1.5")).toBe(0);
    expect(at("1.4")).toBe(1);
    expect(at("1.6")).toBe(1);
  });

  const both = [
    { repo: REPO_A, entries: [entry()] },
    {
      repo: REPO_B,
      entries: [
        entry({ version: "1.6.5", apkUrl: "https://example.com/b/foo.apk" }),
      ],
    },
  ];

  it("takes the first repo when nothing is installed", () => {
    const list = toExtensions(both, []);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: entry().pkg,
      version: "1.6.2",
      repo: "Example",
    });
    expect(list[0].installed).toBe(false);
  });

  it("follows the repo whose key signed the installed build", () => {
    const [e] = toExtensions(both, [inst({ signingKey: "b-key" })]);
    expect(e).toMatchObject({
      installed: true,
      version: "1.6.0",
      latestVersion: "1.6.5",
      signingKey: "b-key",
      apkUrl: "https://example.com/b/foo.apk",
    });
  });

  it("has no latestVersion when the index matches", () => {
    const [e] = toExtensions(
      [{ repo: REPO_A, entries: [entry({ version: "1.6.0" })] }],
      [inst()],
    );
    expect(e.latestVersion).toBeUndefined();
  });

  it("never offers an update signed by another key", () => {
    const [e] = toExtensions(both, [inst({ signingKey: "other-key" })]);
    expect(e.installed).toBe(true);
    expect(e.latestVersion).toBeUndefined();
    expect(e.apkUrl).toBeUndefined();
  });

  it("shows the installed icon first, else the repo's", () => {
    const iconUrl = "https://example.com/a/foo.png";
    const icon = "file:///exts/foo.png";
    const listed = [{ repo: REPO_A, entries: [entry({ iconUrl })] }];
    const unlisted = [{ repo: REPO_A, entries: [entry()] }];
    // Not installed: the repo's.
    expect(toExtensions(listed, [])[0].iconUrl).toBe(iconUrl);
    // Installed: the local file wins, the repo's is the fallback.
    expect(toExtensions(listed, [inst({ icon })])[0].iconUrl).toBe(icon);
    expect(toExtensions(listed, [inst()])[0].iconUrl).toBe(iconUrl);
    expect(toExtensions(unlisted, [inst({ icon })])[0].iconUrl).toBe(icon);
    expect(toExtensions([], [inst({ icon })])[0].iconUrl).toBe(icon);
    expect(toExtensions([], [inst()])[0].iconUrl).toBeUndefined();
  });

  it("exposes the first source's website: installed first, then the index", () => {
    const indexed = entry({
      sources: [
        { id: "1", name: "Foo", lang: "en" },
        { id: "2", name: "Foo 2", lang: "en", homeUrl: "https://index.test" },
      ],
    });
    const listed = [{ repo: REPO_A, entries: [indexed] }];
    const local = inst({
      sources: [
        { id: "1", name: "Foo", lang: "en", homeUrl: "https://local.test" },
      ],
    });
    expect(toExtensions(listed, [])[0].websiteUrl).toBe("https://index.test");
    expect(toExtensions(listed, [local])[0].websiteUrl).toBe(
      "https://local.test",
    );
    expect(toExtensions(listed, [inst()])[0].websiteUrl).toBe(
      "https://index.test",
    );
    expect(toExtensions([], [local])[0].websiteUrl).toBe("https://local.test");
    expect(toExtensions([], [inst()])[0].websiteUrl).toBeUndefined();
  });

  it("ignores an installed website that isn't http(s)", () => {
    const local = inst({
      sources: [{ id: "1", name: "Foo", lang: "en", homeUrl: "intent://x" }],
    });
    expect(toExtensions([], [local])[0].websiteUrl).toBeUndefined();
  });

  it("keeps an installed extension that no index lists", () => {
    const [e] = toExtensions(
      [],
      [inst({ sources: [{ id: "1", name: "F", lang: "ko", homeUrl: null }] })],
    );
    expect(e).toMatchObject({
      id: inst().pkg,
      installed: true,
      language: { code: "ko" },
    });
  });

  it("lists repo packages in repo order, then installed-but-unlisted", () => {
    const pkg = (n: string) => `eu.kanade.tachiyomi.extension.en.${n}`;
    const ids = toExtensions(
      [
        {
          repo: REPO_A,
          entries: [entry({ pkg: pkg("b") }), entry({ pkg: pkg("a") })],
        },
        { repo: REPO_B, entries: [entry({ pkg: pkg("c") })] },
      ],
      [
        inst({ pkg: pkg("z"), signingKey: "x" }),
        inst({ pkg: pkg("c"), signingKey: "b-key" }),
      ],
    ).map((e) => e.id);
    expect(ids).toEqual([pkg("b"), pkg("a"), pkg("c"), pkg("z")]);
  });
});
