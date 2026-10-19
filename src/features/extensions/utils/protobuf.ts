type Value = number | bigint | Uint8Array;
type Fields = Map<number, Value[]>;

export type StoreSource = {
  id?: string;
  name?: string;
  language?: string;
  homeUrl?: string;
  mirrorUrls: string[];
};

export type StoreExtension = {
  name?: string;
  packageName?: string;
  resources?: { apkUrl?: string; iconUrl?: string };
  extensionLib?: string;
  versionCode?: string;
  versionName?: string;
  contentWarning?: string | number;
  sources: StoreSource[];
};

export type StoreExtensionList = { extensions: StoreExtension[] };

export type Store = {
  name?: string;
  badgeLabel?: string;
  signingKey?: string;
  extensionList?: StoreExtensionList;
  extensionListUrl?: string;
};

const MALFORMED = "This repository index is malformed";
const CONTENT_WARNINGS = [
  "CONTENT_WARNING_UNSPECIFIED",
  "CONTENT_WARNING_SAFE",
  "CONTENT_WARNING_MIXED",
  "CONTENT_WARNING_NSFW",
];
const utf8 = new TextDecoder();

/**
 * Splits one message into its fields; varints up to 7 bytes stay numbers, longer ones (int64 ids) become BigInt.
 * @see https://protobuf.dev/programming-guides/encoding/
 */
const readFields = (bytes: Uint8Array): Fields => {
  const fields: Fields = new Map();
  let pos = 0;
  const next = () => {
    if (pos >= bytes.length) throw new Error(MALFORMED);
    return bytes[pos++];
  };
  const varint = (): number | bigint => {
    let value = 0;
    for (let shift = 0; shift < 49; shift += 7) {
      const byte = next();
      value += (byte & 0x7f) * 2 ** shift;
      if (byte < 0x80) return value;
    }
    let big = BigInt(value);
    for (let shift = 49n; shift < 70n; shift += 7n) {
      const byte = next();
      big |= BigInt(byte & 0x7f) << shift;
      if (byte < 0x80) return big;
    }
    throw new Error(MALFORMED);
  };
  const skip = (count: number) => {
    if (pos + count > bytes.length) throw new Error(MALFORMED);
    pos += count;
  };
  while (pos < bytes.length) {
    const tag = Number(varint());
    const field = Math.floor(tag / 8);
    const wire = tag % 8;
    if (field === 0) throw new Error(MALFORMED);
    let value: Value;
    if (wire === 0) value = varint();
    else if (wire === 2) {
      const length = Number(varint());
      skip(length);
      value = bytes.subarray(pos - length, pos);
    } else if (wire === 1) {
      skip(8);
      continue;
    } else if (wire === 5) {
      skip(4);
      continue;
    } else throw new Error(MALFORMED);
    const list = fields.get(field);
    if (list) list.push(value);
    else fields.set(field, [value]);
  }
  return fields;
};

// A singular field repeated on the wire keeps its last value, as protobuf does.
const last = (fields: Fields, field: number) => fields.get(field)?.slice(-1)[0];

const text = (fields: Fields, field: number) => {
  const value = last(fields, field);
  return value instanceof Uint8Array ? utf8.decode(value) : undefined;
};

const texts = (fields: Fields, field: number) =>
  (fields.get(field) ?? []).flatMap((v) =>
    v instanceof Uint8Array ? [utf8.decode(v)] : [],
  );

const messages = (fields: Fields, field: number) =>
  (fields.get(field) ?? []).flatMap((v) =>
    v instanceof Uint8Array ? [readFields(v)] : [],
  );

const message = (fields: Fields, field: number) =>
  messages(fields, field).slice(-1)[0];

// int64 as a decimal string, like protobuf's JSON mapping; a number can't hold every id.
const int64 = (fields: Fields, field: number) => {
  const value = last(fields, field);
  if (typeof value === "bigint") return BigInt.asIntN(64, value).toString();
  return typeof value === "number" ? String(value) : undefined;
};

const enumValue = (fields: Fields, field: number) => {
  const value = last(fields, field);
  if (typeof value !== "number") return undefined;
  return CONTENT_WARNINGS[value] ?? value;
};

/**
 * The store messages' field numbers.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkExtensionStore.kt
 */
const source = (fields: Fields): StoreSource => ({
  id: int64(fields, 1),
  name: text(fields, 2),
  language: text(fields, 3),
  homeUrl: text(fields, 4),
  mirrorUrls: texts(fields, 5),
});

const extension = (fields: Fields): StoreExtension => {
  const resources = message(fields, 3);
  return {
    name: text(fields, 1),
    packageName: text(fields, 2),
    resources: resources && {
      apkUrl: text(resources, 1),
      iconUrl: text(resources, 2),
    },
    extensionLib: text(fields, 4),
    versionCode: int64(fields, 5),
    versionName: text(fields, 6),
    contentWarning: enumValue(fields, 7),
    sources: messages(fields, 8).map(source),
  };
};

const extensionList = (fields: Fields): StoreExtensionList => ({
  extensions: messages(fields, 1).map(extension),
});

/**
 * Decodes a v2 store from protobuf into its JSON shape; unknown fields are skipped.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkExtensionStore.kt
 */
export const decodeStore = (bytes: Uint8Array): Store => {
  const fields = readFields(bytes);
  const list = message(fields, 101);
  return {
    name: text(fields, 1),
    badgeLabel: text(fields, 2),
    signingKey: text(fields, 3),
    extensionList: list && extensionList(list),
    extensionListUrl: text(fields, 102),
  };
};

/**
 * Decodes an extension list served on its own (a store's `extensionListUrl`).
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkExtensionStore.kt
 */
export const decodeExtensionList = (bytes: Uint8Array): StoreExtensionList =>
  extensionList(readFields(bytes));
