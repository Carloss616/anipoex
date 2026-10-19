import type { Extension, Language } from "./extension";

export const EN: Language = { code: "en", name: "English" };
export const KO: Language = { code: "ko", name: "Korean" };
export const MULTI: Language = { code: "mul", name: "Multi" };

/** Test fixtures shared by the `utils` tests. */
export const ext = (
  over: Partial<Extension> & Pick<Extension, "id">,
): Extension => ({
  name: over.id,
  initials: "XX",
  language: EN,
  version: "1.0.0",
  installed: false,
  ...over,
});

export const LIST: Extension[] = [
  ext({ id: "source-c", name: "Source C", language: MULTI, installed: true }),
  ext({
    id: "source-a",
    name: "Source A",
    installed: true,
    latestVersion: "1.1.0",
  }),
  ext({
    id: "source-b",
    name: "Source B",
    language: MULTI,
    installed: true,
    latestVersion: "1.0.1",
  }),
  ext({ id: "source-d", name: "Source D" }),
  ext({ id: "source-e", name: "Source E", language: KO }),
];

/** Minimal protobuf encoder, enough to build the repository messages the decoder reads. */
export const pb = {
  varint: (value: bigint | number): number[] => {
    let v = BigInt.asUintN(64, BigInt(value));
    const out: number[] = [];
    while (v >= 0x80n) {
      out.push(Number(v & 0x7fn) | 0x80);
      v >>= 7n;
    }
    out.push(Number(v));
    return out;
  },
  tag: (field: number, wire: number) => pb.varint((field << 3) | wire),
  bytes: (field: number, data: number[]) => [
    ...pb.tag(field, 2),
    ...pb.varint(data.length),
    ...data,
  ],
  text: (field: number, value: string) =>
    pb.bytes(field, [...new TextEncoder().encode(value)]),
  int: (field: number, value: bigint | number) => [
    ...pb.tag(field, 0),
    ...pb.varint(value),
  ],
};
