const CORRUPT = "This repository index is corrupt";
/**
 * Length and distance codes: base value plus extra bits.
 * @see https://www.rfc-editor.org/rfc/rfc1951#section-3.2.5
 */
const LENGTH_BASE = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67,
  83, 99, 115, 131, 163, 195, 227, 258,
];
const LENGTH_EXTRA = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
  5, 5, 0,
];
const DIST_BASE = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769,
  1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DIST_EXTRA = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
  11, 12, 12, 13, 13,
];
/**
 * Order the code-length code lengths are sent in.
 * @see https://www.rfc-editor.org/rfc/rfc1951#section-3.2.7
 */
const CODE_LENGTH_ORDER = [
  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
];

type Huffman = { counts: Uint16Array; symbols: Uint16Array };

// Canonical Huffman table: how many codes per bit length, symbols in code order.
const huffman = (lengths: Uint8Array): Huffman => {
  const counts = new Uint16Array(16);
  for (const length of lengths) counts[length]++;
  counts[0] = 0;
  const offsets = new Uint16Array(16);
  for (let i = 1; i < 16; i++) offsets[i] = offsets[i - 1] + counts[i - 1];
  const symbols = new Uint16Array(lengths.length);
  lengths.forEach((length, symbol) => {
    if (length) symbols[offsets[length]++] = symbol;
  });
  return { counts, symbols };
};

const FIXED_LITERALS = huffman(
  Uint8Array.from({ length: 288 }, (_, i) =>
    i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8,
  ),
);
const FIXED_DISTANCES = huffman(new Uint8Array(30).fill(5));

/**
 * Inflates raw DEFLATE data, following zlib's reference inflater.
 * @see https://www.rfc-editor.org/rfc/rfc1951#section-3.2
 * @see https://github.com/madler/zlib/blob/develop/contrib/puff/puff.c
 */
const inflate = (data: Uint8Array): Uint8Array => {
  let pos = 0;
  let bit = 0;
  let out = new Uint8Array(Math.max(1024, data.length * 4));
  let size = 0;

  const bits = (count: number): number => {
    let value = 0;
    for (let i = 0; i < count; i++) {
      if (pos >= data.length) throw new Error(CORRUPT);
      value |= ((data[pos] >> bit) & 1) << i;
      if (++bit === 8) {
        bit = 0;
        pos++;
      }
    }
    return value;
  };

  const decode = ({ counts, symbols }: Huffman): number => {
    let code = 0;
    let first = 0;
    let index = 0;
    for (let length = 1; length < 16; length++) {
      code |= bits(1);
      const count = counts[length];
      if (code - first < count) return symbols[index + code - first];
      index += count;
      first = (first + count) << 1;
      code <<= 1;
    }
    throw new Error(CORRUPT);
  };

  const push = (byte: number) => {
    if (size === out.length) {
      const grown = new Uint8Array(out.length * 2);
      grown.set(out);
      out = grown;
    }
    out[size++] = byte;
  };

  const dynamicTables = (): [Huffman, Huffman] => {
    const literals = bits(5) + 257;
    const distances = bits(5) + 1;
    const codeLengths = new Uint8Array(19);
    const declared = bits(4) + 4;
    for (let i = 0; i < declared; i++)
      codeLengths[CODE_LENGTH_ORDER[i]] = bits(3);
    const lengthCode = huffman(codeLengths);
    const lengths = new Uint8Array(literals + distances);
    for (let i = 0; i < lengths.length; ) {
      const symbol = decode(lengthCode);
      if (symbol < 16) {
        lengths[i++] = symbol;
        continue;
      }
      if (symbol === 16 && i === 0) throw new Error(CORRUPT);
      const value = symbol === 16 ? lengths[i - 1] : 0;
      const repeat =
        symbol === 16
          ? 3 + bits(2)
          : symbol === 17
            ? 3 + bits(3)
            : 11 + bits(7);
      if (i + repeat > lengths.length) throw new Error(CORRUPT);
      lengths.fill(value, i, i + repeat);
      i += repeat;
    }
    return [
      huffman(lengths.subarray(0, literals)),
      huffman(lengths.subarray(literals)),
    ];
  };

  let last = 0;
  while (!last) {
    last = bits(1);
    const type = bits(2);
    if (type === 0) {
      if (bit) {
        bit = 0;
        pos++;
      }
      if (pos + 4 > data.length) throw new Error(CORRUPT);
      const length = data[pos] | (data[pos + 1] << 8);
      pos += 4;
      if (pos + length > data.length) throw new Error(CORRUPT);
      for (let i = 0; i < length; i++) push(data[pos++]);
      continue;
    }
    if (type === 3) throw new Error(CORRUPT);
    const [literals, distances] =
      type === 1 ? [FIXED_LITERALS, FIXED_DISTANCES] : dynamicTables();
    for (;;) {
      const symbol = decode(literals);
      if (symbol < 256) {
        push(symbol);
        continue;
      }
      if (symbol === 256) break;
      const lengthIndex = symbol - 257;
      if (lengthIndex >= LENGTH_BASE.length) throw new Error(CORRUPT);
      const length = LENGTH_BASE[lengthIndex] + bits(LENGTH_EXTRA[lengthIndex]);
      const distanceIndex = decode(distances);
      if (distanceIndex >= DIST_BASE.length) throw new Error(CORRUPT);
      const distance =
        DIST_BASE[distanceIndex] + bits(DIST_EXTRA[distanceIndex]);
      if (distance > size) throw new Error(CORRUPT);
      for (let i = 0; i < length; i++) push(out[size - distance]);
    }
  }
  return out.subarray(0, size);
};

/**
 * Unzips a gzip body; Hermes has no DecompressionStream, and Mihon's `decompressIfGzipped` accepts gzipped stores.
 * @see https://www.rfc-editor.org/rfc/rfc1952#section-2.3
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/service/ExtensionStoreService.kt
 */
export const gunzip = (bytes: Uint8Array): Uint8Array => {
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes[2] !== 8)
    throw new Error(CORRUPT);
  const flags = bytes[3];
  let pos = 10;
  if (flags & 4) pos += 2 + (bytes[pos] | (bytes[pos + 1] << 8));
  for (const flag of [8, 16]) {
    if (flags & flag) {
      while (pos < bytes.length && bytes[pos] !== 0) pos++;
      pos++;
    }
  }
  if (flags & 2) pos += 2;
  if (pos > bytes.length) throw new Error(CORRUPT);
  // shortcut: the CRC32 trailer isn't checked; TLS already guards the transfer and a bad body fails to parse.
  return inflate(bytes.subarray(pos));
};
