import { describe, expect, it } from "bun:test";
import { pb } from "./fixtures";
import { decodeExtensionList, decodeStore } from "./protobuf";

const BIG_ID = "9007199254740993";
const NEGATIVE_ID = "-5";

const { tag, bytes, text, int } = pb;
const fixed64 = (field: number) => [...tag(field, 1), 1, 2, 3, 4, 5, 6, 7, 8];
const fixed32 = (field: number) => [...tag(field, 5), 1, 2, 3, 4];

const SOURCE = [
  ...int(1, BigInt(BIG_ID)),
  ...text(2, "Exämple 日本"),
  ...text(3, "ja"),
  ...text(4, "https://example.com"),
  ...text(5, "https://a.example.com"),
  ...text(5, "https://b.example.com"),
  ...int(6, 2),
];

const EXTENSION = [
  ...text(1, "Example"),
  ...text(2, "eu.kanade.tachiyomi.extension.all.example"),
  ...bytes(3, [
    ...text(1, "https://example.com/example.apk"),
    ...text(2, "https://example.com/example.png"),
  ]),
  ...text(4, "1.6"),
  ...int(5, 106004),
  ...text(6, "1.6.4"),
  ...int(7, 3),
  ...bytes(8, SOURCE),
  ...bytes(8, [...int(1, -5), ...text(2, "Other"), ...text(3, "en")]),
];

const LIST = bytes(1, EXTENSION);

const STORE = [
  ...text(1, "Example"),
  ...text(2, "EX"),
  ...text(3, "a".repeat(64)),
  ...bytes(4, text(1, "https://example.com")),
  ...fixed64(50),
  ...fixed32(51),
  ...int(52, 7),
  ...bytes(101, LIST),
];

const EXPECTED_EXTENSION = {
  name: "Example",
  packageName: "eu.kanade.tachiyomi.extension.all.example",
  resources: {
    apkUrl: "https://example.com/example.apk",
    iconUrl: "https://example.com/example.png",
  },
  extensionLib: "1.6",
  versionName: "1.6.4",
  contentWarning: "CONTENT_WARNING_NSFW",
  sources: [
    {
      id: BIG_ID,
      name: "Exämple 日本",
      language: "ja",
      homeUrl: "https://example.com",
    },
    { id: NEGATIVE_ID, name: "Other", language: "en" },
  ],
};

describe("decodeStore", () => {
  it("reads the store, its inline list and int64 ids as exact strings", () => {
    expect(decodeStore(new Uint8Array(STORE))).toEqual({
      name: "Example",
      signingKey: "a".repeat(64),
      extensionList: { extensions: [EXPECTED_EXTENSION] },
    });
  });

  it("reads extensionListUrl", () => {
    const store = [
      ...text(1, "Example"),
      ...text(3, "a".repeat(64)),
      ...text(102, "https://example.com/list.pb"),
    ];
    expect(decodeStore(new Uint8Array(store))).toEqual({
      name: "Example",
      signingKey: "a".repeat(64),
      extensionListUrl: "https://example.com/list.pb",
    });
  });

  it("names every content warning", () => {
    const names = [0, 1, 2, 3, 9].map(
      (value) =>
        decodeExtensionList(new Uint8Array(bytes(1, int(7, value))))
          .extensions[0].contentWarning,
    );
    expect(names).toEqual([
      "CONTENT_WARNING_UNSPECIFIED",
      "CONTENT_WARNING_SAFE",
      "CONTENT_WARNING_MIXED",
      "CONTENT_WARNING_NSFW",
      9,
    ]);
  });

  it("throws on a truncated message", () => {
    expect(() => decodeStore(new Uint8Array(STORE.slice(0, -3)))).toThrow(
      "This repository index is malformed",
    );
    expect(() => decodeStore(new Uint8Array([0x0a, 0x05, 0x41]))).toThrow(
      "This repository index is malformed",
    );
  });

  it("throws on a group or field 0", () => {
    expect(() => decodeStore(new Uint8Array(tag(1, 3)))).toThrow(
      "This repository index is malformed",
    );
    expect(() => decodeStore(new Uint8Array([0x00, 0x01]))).toThrow(
      "This repository index is malformed",
    );
  });
});

describe("decodeExtensionList", () => {
  it("reads a list served on its own", () => {
    expect(decodeExtensionList(new Uint8Array(LIST))).toEqual({
      extensions: [EXPECTED_EXTENSION],
    });
  });
});
