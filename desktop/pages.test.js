import { expect, test } from "bun:test";
import { PAGE_SCHEME, pageStore, servePage } from "./pages.js";

const HEADERS = { Referer: "https://example.com/" };
const page = (index, imageUrl = `https://example.com/${index}.png`) => ({
  index,
  imageUrl,
  headers: HEADERS,
});

test("rewritesAndRemembers", () => {
  const store = pageStore();
  const [rewritten] = store.rewrite([page(0, "https://example.com/1.png")]);
  expect(rewritten.imageUrl.startsWith(`${PAGE_SCHEME}://p/`)).toBe(true);
  expect(rewritten.headers).toEqual({});
  expect(store.lookup(rewritten.imageUrl)).toEqual({
    imageUrl: "https://example.com/1.png",
    headers: HEADERS,
  });
});

test("unknownIsUndefined", () => {
  expect(pageStore().lookup(`${PAGE_SCHEME}://p/nope`)).toBeUndefined();
});

test("evictsOldest", () => {
  const store = pageStore(2);
  const [first] = store.rewrite([page(0), page(1), page(2)]);
  expect(store.lookup(first.imageUrl)).toBeUndefined();
});

test("dropsNonWebUpstream", () => {
  const store = pageStore();
  expect(store.rewrite([page(0, "file:///etc/passwd")])).toEqual([]);
});

const served = (store, fetch) => {
  const [{ imageUrl }] = store.rewrite([page(0)]);
  return servePage(store, imageUrl, fetch);
};

test("unknownIs404", async () => {
  const response = await servePage(
    pageStore(),
    `${PAGE_SCHEME}://p/nope`,
    () => {
      throw new Error("unreachable");
    },
  );
  expect(response.status).toBe(404);
  expect(await response.text()).toBe("");
});

test("sendsHeadersAndPassesContentType", async () => {
  let call;
  const response = await served(pageStore(), async (url, init) => {
    call = { url, init };
    return new Response("img", { headers: { "Content-Type": "image/webp" } });
  });
  expect(call.url).toBe("https://example.com/0.png");
  expect(call.init.headers).toEqual(HEADERS);
  expect(response.headers.get("Content-Type")).toBe("image/webp");
  expect(await response.text()).toBe("img");
});

test("dropsOrigin", async () => {
  const store = pageStore();
  const [{ imageUrl }] = store.rewrite([
    { ...page(0), headers: { ...HEADERS, Origin: "https://example.com" } },
  ]);
  let headers;
  await servePage(store, imageUrl, async (_, init) => {
    headers = init.headers;
    return new Response("img");
  });
  expect(headers).toEqual(HEADERS);
});

test("upstreamStatusPassesThrough", async () => {
  const response = await served(
    pageStore(),
    async () => new Response("<html>", { status: 403 }),
  );
  expect(response.status).toBe(403);
  expect(await response.text()).toBe("");
});

test("nonImageIs415", async () => {
  const response = await served(
    pageStore(),
    async () =>
      new Response("<script>", { headers: { "Content-Type": "text/html" } }),
  );
  expect(response.status).toBe(415);
  expect(await response.text()).toBe("");
});

test("networkFailureIs502", async () => {
  const response = await served(pageStore(), async () => {
    throw new Error("offline");
  });
  expect(response.status).toBe(502);
});
