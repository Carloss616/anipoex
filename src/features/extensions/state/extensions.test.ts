import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { observable } from "@legendapp/state";
import type { Extension } from "../utils/extension";
import type { Repo } from "../utils/repo";

const GOOD: Repo = { baseUrl: "https://good", name: "Good", signingKey: "k1" };
const BAD: Repo = { baseUrl: "https://bad", name: "Bad", signingKey: "k2" };

const INDEX = [
  {
    name: "Tachiyomi: Foo",
    pkg: "pkg.foo",
    apk: "foo.apk",
    lang: "en",
    code: 1,
    version: "1.4.1",
    nsfw: 0,
    sources: [{ name: "Foo", lang: "en", id: "1", baseUrl: "" }],
  },
];

const install = mock(async (_apkUrl: string, _key: string) => ({}));
const installed = mock(async () => [
  {
    pkg: "pkg.local",
    name: "Local",
    version: "1.4.9",
    lib: 14,
    signingKey: "k3",
    sources: [],
  },
]);
const destructive = mock((_label: string) => {});
const repos$ = observable<Repo[]>([BAD, GOOD]);

mock.module("../runtime", () => ({
  runtime: { install, installed, uninstall: mock(async () => {}) },
}));
mock.module("@/components/ui/toast", () => ({ toast: { destructive } }));
mock.module("./repos", () => ({ repos$ }));

const {
  extensions$,
  installed$,
  installedLoaded$,
  installExtension,
  loadExtensions,
  refreshInstalled,
  updateAllExtensions,
} = await import("./extensions");

const realFetch = globalThis.fetch;

let hold: Promise<void> | undefined;
const fetched: string[] = [];

beforeEach(() => {
  install.mockClear();
  installed.mockClear();
  destructive.mockClear();
  fetched.length = 0;
  hold = undefined;
  globalThis.fetch = (async (url: string) => {
    fetched.push(url);
    await hold;
    return url.startsWith("https://good")
      ? Response.json(INDEX)
      : new Response("", { status: 500 });
  }) as unknown as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("loadExtensions", () => {
  it("keeps what is installed and what the reachable repo lists", async () => {
    await loadExtensions();
    expect(
      extensions$
        .peek()
        .map((e) => e.id)
        .sort(),
    ).toEqual(["pkg.foo", "pkg.local"]);
    expect(destructive).toHaveBeenCalledWith("Couldn't load Bad");
  });
});

describe("loadExtensions failures", () => {
  it("keeps the previous list when an installed entry can't be read", async () => {
    await loadExtensions();
    const before = extensions$.peek();
    installed.mockImplementationOnce(
      async () => [{ pkg: "pkg.broken" }] as never,
    );
    await loadExtensions();
    expect(extensions$.peek()).toEqual(before);
    expect(destructive).toHaveBeenCalled();
  });

  it("keeps the installed list when the runtime fails", async () => {
    await loadExtensions();
    installed.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    await loadExtensions();
    expect(destructive).toHaveBeenCalledWith("boom");
    expect(installed$.peek().map((e) => e.pkg)).toEqual(["pkg.local"]);
    expect(extensions$.peek().some((e) => e.id === "pkg.local")).toBe(true);
  });
});

describe("loadExtensions races", () => {
  it("keeps the newest load when an older one finishes last", async () => {
    let release = () => {};
    hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    installed.mockImplementationOnce(async () => []);
    const stale = loadExtensions();
    await new Promise((resolve) => setTimeout(resolve, 0));
    hold = undefined;
    await loadExtensions();
    release();
    await stale;
    expect(extensions$.peek().some((e) => e.id === "pkg.local")).toBe(true);
  });
});

describe("updateAllExtensions", () => {
  const pending = (id: string): Extension => ({
    id,
    name: id,
    initials: "XX",
    language: { code: "en", name: "English" },
    version: "1.0.0",
    latestVersion: "1.1.0",
    installed: true,
    apkUrl: `https://good/${id}.apk`,
    signingKey: "k1",
  });

  it("installs one at a time and reloads once", async () => {
    extensions$.set([pending("pkg.a"), pending("pkg.b")]);
    let active = 0;
    let overlap = false;
    install.mockImplementation(async () => {
      overlap ||= active > 0;
      active++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return {};
    });
    await updateAllExtensions();
    install.mockImplementation(async () => ({}));
    expect(install).toHaveBeenCalledTimes(2);
    expect(overlap).toBe(false);
    expect(installed).toHaveBeenCalledTimes(1);
    expect(fetched.filter((u) => u.startsWith("https://good"))).toHaveLength(1);
  });
});

describe("installExtension", () => {
  it("runs once for the same id and passes apkUrl and signingKey", async () => {
    await loadExtensions();
    const apkUrl = extensions$.peek().find((e) => e.id === "pkg.foo")?.apkUrl;
    await Promise.all([
      installExtension("pkg.foo"),
      installExtension("pkg.foo"),
    ]);
    expect(install).toHaveBeenCalledTimes(1);
    expect(install).toHaveBeenCalledWith(apkUrl, "k1");
  });

  it("toasts instead of installing an extension with no apk", async () => {
    await loadExtensions();
    await installExtension("pkg.local");
    expect(install).not.toHaveBeenCalled();
    expect(destructive).toHaveBeenCalled();
  });
});

describe("installed$", () => {
  it("is marked loaded once read", async () => {
    await refreshInstalled();
    expect(installedLoaded$.peek()).toBe(true);
  });

  it("follows a successful install", async () => {
    await loadExtensions();
    installed.mockImplementationOnce(async () => [
      {
        pkg: "pkg.foo",
        name: "Foo",
        version: "1.4.1",
        lib: 14,
        signingKey: "k1",
        sources: [],
      },
    ]);
    await installExtension("pkg.foo");
    expect(installed$.peek().map((e) => e.pkg)).toEqual(["pkg.foo"]);
  });

  it("keeps the old list when the runtime fails", async () => {
    await refreshInstalled();
    installed.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    const warn = mock(() => {});
    const real = console.warn;
    console.warn = warn;
    await refreshInstalled();
    console.warn = real;
    expect(warn).toHaveBeenCalled();
    expect(installed$.peek().map((e) => e.pkg)).toEqual(["pkg.local"]);
  });

  it("a failed refresh still marks the list loaded", async () => {
    installedLoaded$.set(false);
    installed.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    const real = console.warn;
    console.warn = mock(() => {});
    await refreshInstalled();
    console.warn = real;
    expect(installedLoaded$.peek()).toBe(true);
  });
});
