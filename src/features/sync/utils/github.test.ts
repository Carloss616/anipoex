import { describe, expect, it } from "bun:test";
import { network$, networkAnswered } from "@/state/network";
import { pollForToken, requestDeviceCode } from "./device-flow";
import { createGistTarget, MANIFEST, type SyncError } from "./github";

type Route = (url: string, init: RequestInit) => unknown;

/** A fetch that answers from `routes` by method and URL, and logs calls. */
const fakeFetch = (routes: Record<string, Route>) => {
  const calls: string[] = [];
  const fn = (async (url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? "GET"} ${url}`;
    calls.push(key);
    const route = Object.entries(routes).find(([k]) => key.startsWith(k));
    if (!route) return new Response("not found", { status: 404 });
    const body = route[1](url, init);
    return body instanceof Response
      ? body
      : new Response(typeof body === "string" ? body : JSON.stringify(body));
  }) as typeof fetch;
  return { fn, calls };
};

const id = () => {
  let value: string | undefined;
  return { get: () => value, set: (v: string | undefined) => (value = v) };
};

describe("createGistTarget", () => {
  it("finds the gist by its manifest and reads its files", async () => {
    const { fn } = fakeFetch({
      "GET https://api.github.com/gists?": () => [
        { id: "other", files: { "notes.md": {} } },
        { id: "g1", files: { [MANIFEST]: {} } },
      ],
      "GET https://api.github.com/gists/g1": () => ({
        id: "g1",
        files: {
          [MANIFEST]: { content: "{}" },
          "anipoex-pins.mac.json": { content: "small" },
          "anipoex-probes.mac.json": {
            truncated: true,
            raw_url: "https://gist.githubusercontent.com/raw/probes",
          },
        },
      }),
      "GET https://gist.githubusercontent.com/raw/probes": () => "whole",
    });
    const gistId = id();
    const target = createGistTarget({ token: "t", gistId, fetchFn: fn });

    expect(await target.list()).toContain("anipoex-pins.mac.json");
    expect(gistId.get()).toBe("g1");
    expect(await target.read("anipoex-pins.mac.json")).toBe("small");
    // Past 1 MB the API cuts the content; the raw URL has it whole.
    expect(await target.read("anipoex-probes.mac.json")).toBe("whole");
  });

  it("downloads nothing again while the gist hasn't changed", async () => {
    let raws = 0;
    const gist = {
      id: "g1",
      files: {
        "anipoex-probes.mac.json": {
          truncated: true,
          raw_url: "https://gist.githubusercontent.com/raw/sha1/probes",
        },
      },
    };
    const fn = (async (url: string, init: RequestInit = {}) => {
      if (url.startsWith("https://gist.githubusercontent.com/")) {
        raws++;
        return new Response("whole");
      }
      const sent = (init.headers as Record<string, string>)["If-None-Match"];
      return sent === '"v1"'
        ? new Response(null, { status: 304 })
        : new Response(JSON.stringify(gist), { headers: { ETag: '"v1"' } });
    }) as typeof fetch;
    const gistId = id();
    gistId.set("g1");
    const target = createGistTarget({ token: "t", gistId, fetchFn: fn });

    for (let i = 0; i < 2; i++) {
      await target.list();
      expect(await target.read("anipoex-probes.mac.json")).toBe("whole");
    }

    expect(raws).toBe(1);
  });

  it("makes a private gist when the user has none", async () => {
    let created: { public?: boolean } = {};
    const { fn } = fakeFetch({
      "GET https://api.github.com/gists?": () => [],
      "POST https://api.github.com/gists": (_, init) => {
        created = JSON.parse(String(init.body));
        return { id: "new", files: {} };
      },
      "GET https://api.github.com/gists/new": () => ({ id: "new", files: {} }),
    });
    const gistId = id();

    await createGistTarget({ token: "t", gistId, fetchFn: fn }).list();

    expect(gistId.get()).toBe("new");
    expect(created.public).toBe(false);
  });

  it("writes this device's files in one PATCH", async () => {
    let sent: unknown;
    const { fn } = fakeFetch({
      "PATCH https://api.github.com/gists/g1": (_, init) => {
        sent = JSON.parse(String(init.body));
        return {};
      },
    });
    const gistId = id();
    gistId.set("g1");

    await createGistTarget({ token: "t", gistId, fetchFn: fn }).write({
      "anipoex-pins.mac.json": "{}",
    });

    expect(sent).toEqual({
      files: { "anipoex-pins.mac.json": { content: "{}" } },
    });
  });

  it("tells a revoked token and no connection apart", async () => {
    const revoked = fakeFetch({
      "GET https://api.github.com/gists/g1": () =>
        new Response("", { status: 401 }),
    });
    const gistId = id();
    gistId.set("g1");
    const offline = (async () => {
      throw new TypeError("Network request failed");
    }) as unknown as typeof fetch;

    const kind = (p: Promise<unknown>) =>
      p.catch((error: SyncError) => error.kind);
    expect(
      await kind(
        createGistTarget({ token: "t", gistId, fetchFn: revoked.fn }).list(),
      ),
    ).toBe("auth");
    expect(
      await kind(
        createGistTarget({ token: "t", gistId, fetchFn: offline }).list(),
      ),
    ).toBe("offline");
  });

  it("an offline GitHub call marks the network offline", async () => {
    const gistId = id();
    gistId.set("g1");
    const offline = (async () => {
      throw new TypeError("Network request failed");
    }) as unknown as typeof fetch;
    try {
      await createGistTarget({ token: "t", gistId, fetchFn: offline })
        .list()
        .catch(() => {});
      expect(network$.online.peek()).toBe(false);
    } finally {
      networkAnswered();
    }
  });

  it("names GitHub's rate limit instead of its status", async () => {
    const limited = fakeFetch({
      "GET https://api.github.com/gists/g1": () =>
        new Response('{"message":"API rate limit exceeded for user ID 1."}', {
          status: 403,
        }),
    });
    const gistId = id();
    gistId.set("g1");

    const error = await createGistTarget({
      token: "t",
      gistId,
      fetchFn: limited.fn,
    })
      .list()
      .catch((e: SyncError) => e);

    expect((error as SyncError).message).toBe(
      "GitHub asked to wait; it tries again later",
    );
    // No header says when: a few minutes.
    expect((error as SyncError).retryAt).toBeGreaterThan(Date.now());
  });

  it("waits as long as GitHub's retry-after says", async () => {
    const limited = fakeFetch({
      "GET https://api.github.com/gists/g1": () =>
        new Response("", { status: 429, headers: { "retry-after": "60" } }),
    });
    const gistId = id();
    gistId.set("g1");
    const before = Date.now();

    const error = (await createGistTarget({
      token: "t",
      gistId,
      fetchFn: limited.fn,
    })
      .list()
      .catch((e: SyncError) => e)) as SyncError;

    expect(error.retryAt).toBeGreaterThanOrEqual(before + 60_000);
    expect(error.retryAt).toBeLessThan(before + 61_000);
  });
});

describe("device flow", () => {
  it("polls until the code is authorized, slowing down when asked", async () => {
    const answers = [
      { error: "authorization_pending" },
      { error: "slow_down" },
      { access_token: "gho_token" },
    ];
    const waits: number[] = [];
    const post = async (url: string) =>
      url.endsWith("/device/code")
        ? {
            device_code: "d",
            user_code: "WDJB-MJHT",
            interval: 5,
            expires_in: 900,
          }
        : (answers.shift() ?? {});

    const code = await requestDeviceCode("client", post, () => 0);
    const token = await pollForToken("client", code, post, {
      sleep: async (ms) => waits.push(ms),
      now: () => 0,
    });

    expect(code.userCode).toBe("WDJB-MJHT");
    expect(token).toBe("gho_token");
    expect(waits).toEqual([5000, 5000, 10000]);
  });

  it("keeps polling through a dropped request", async () => {
    let calls = 0;
    const post = async () => {
      calls++;
      if (calls === 1) throw new TypeError("Network request failed");
      if (calls === 2) return { error: "offline" };
      return { access_token: "gho_token" };
    };
    const code = {
      userCode: "x",
      verificationUri: "",
      deviceCode: "d",
      interval: 1,
      expiresAt: 10,
    };

    expect(
      await pollForToken("client", code, post, {
        sleep: async () => {},
        now: () => 0,
      }),
    ).toBe("gho_token");
  });

  it("stops when the user denies access", async () => {
    const post = async () => ({ error: "access_denied" });
    const code = {
      userCode: "x",
      verificationUri: "",
      deviceCode: "d",
      interval: 1,
      expiresAt: 10,
    };

    await expect(
      pollForToken("client", code, post, {
        sleep: async () => {},
        now: () => 0,
      }),
    ).rejects.toThrow("Access was denied on GitHub");
  });
});
