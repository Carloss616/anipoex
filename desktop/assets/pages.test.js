import { expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PAGE_SCHEME, pageStore, servePage } from "./pages.js";

const page = (index, imageUrl = `https://example.com/${index}.png`) => ({
  index,
  imageUrl,
  headers: { Referer: "https://example.com/" },
});

// A page the runtime wrote, as its `image` call answers.
const file = (contents, type) => {
  const target = path.join(mkdtempSync(path.join(tmpdir(), "page-")), "page");
  writeFileSync(target, contents);
  return { uri: pathToFileURL(target).toString(), type };
};

test("rewritesAndRemembers", () => {
  const store = pageStore();
  const [rewritten] = store.rewrite("7", [
    page(3, "https://example.com/1.png"),
  ]);
  expect(rewritten.imageUrl.startsWith(`${PAGE_SCHEME}://p/`)).toBe(true);
  expect(rewritten.headers).toEqual({});
  expect(store.lookup(rewritten.imageUrl)).toEqual({
    sourceId: "7",
    imageUrl: "https://example.com/1.png",
    index: 3,
  });
});

test("unknownIsUndefined", () => {
  expect(pageStore().lookup(`${PAGE_SCHEME}://p/nope`)).toBeUndefined();
});

test("evictsOldest", () => {
  const store = pageStore(2);
  const [first] = store.rewrite("7", [page(0), page(1), page(2)]);
  expect(store.lookup(first.imageUrl)).toBeUndefined();
});

test("dropsNonWebUpstream", () => {
  const store = pageStore();
  expect(store.rewrite("7", [page(0, "file:///etc/passwd")])).toEqual([]);
});

const served = (store, image) => {
  const [{ imageUrl }] = store.rewrite("7", [page(0)]);
  return servePage(store, imageUrl, image);
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

test("servesWhatTheRuntimeFetched", async () => {
  let asked;
  const response = await served(pageStore(), async (args) => {
    asked = args;
    return file("img", "image/webp");
  });
  expect(asked).toEqual({
    sourceId: "7",
    imageUrl: "https://example.com/0.png",
    index: 0,
  });
  expect(response.headers.get("Content-Type")).toBe("image/webp");
  expect(await response.text()).toBe("img");
});

test("documentIs415", async () => {
  const response = await served(pageStore(), async () =>
    file("<script>", "text/html"),
  );
  expect(response.status).toBe(415);
  expect(await response.text()).toBe("");
});

test("untypedIsOctetStream", async () => {
  for (const type of [null, "application/octet-stream"]) {
    const response = await served(pageStore(), async () =>
      file(new Uint8Array([1, 2]), type),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/octet-stream",
    );
  }
});

test("runtimeFailureIs502", async () => {
  const response = await served(pageStore(), async () => {
    throw new Error("HTTP error 403");
  });
  expect(response.status).toBe(502);
});
