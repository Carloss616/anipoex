import { expect, it } from "bun:test";
import { gunzip } from "./gzip";

const SAMPLE = new TextEncoder().encode(
  Array.from(
    { length: 4000 },
    (_, i) => `entry ${i} ${(i * 2654435761) % 977} ëxämple 日本\n`,
  ).join(""),
);

it("inflates dynamic, fixed and stored blocks", () => {
  for (const level of [0, 1, 6, 9] as const) {
    expect(gunzip(Bun.gzipSync(SAMPLE, { level }))).toEqual(SAMPLE);
  }
  const short = new TextEncoder().encode("abcabcabcabc");
  expect(gunzip(Bun.gzipSync(short))).toEqual(short);
  expect(gunzip(Bun.gzipSync(new Uint8Array()))).toEqual(new Uint8Array());
});

it("skips the optional name field of the header", () => {
  const plain = Bun.gzipSync(SAMPLE);
  const named = new Uint8Array([
    ...plain.subarray(0, 3),
    plain[3] | 8,
    ...plain.subarray(4, 10),
    ...new TextEncoder().encode("index.pb"),
    0,
    ...plain.subarray(10),
  ]);
  expect(gunzip(named)).toEqual(SAMPLE);
});

it("throws on a corrupt or truncated stream", () => {
  const gz = Bun.gzipSync(SAMPLE);
  expect(() => gunzip(gz.subarray(0, gz.length / 2))).toThrow(
    "This repository index is corrupt",
  );
  expect(() => gunzip(new Uint8Array([0x1f, 0x8b, 9, 0]))).toThrow(
    "This repository index is corrupt",
  );
});
