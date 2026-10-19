import { gunzipSync } from "fflate";
import { isWebUrl } from "@/utils/is-web-url";
import { decodeExtensionList, decodeStore } from "./protobuf";

/**
 * A repo as the user added it: legacy (`repo.json` + `index.min.json`) or a v2 store.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkExtensionStore.kt
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkLegacyExtensionRepo.kt
 */
export type Repo = {
  baseUrl: string;
  name: string;
  signingKey: string;
  indexUrl: string;
  legacy: boolean;
  extensionListUrl?: string;
};

export type RepoEntry = {
  pkg: string;
  name: string;
  version: string;
  lib: string;
  apkUrl: string;
  iconUrl?: string;
  nsfw: boolean;
  sources: { id: string; name: string; lang: string; homeUrl?: string }[];
};

type Json = Record<string, unknown>;

const CORRUPT = "This repository index is corrupt";
const NOT_A_REPO = "This isn't an extension repository";
const HTTPS_ONLY = "Repository URLs must use https";
const LEGACY_LIST = "Add this repository by its index.min.json URL";
const GITHUB_RAW = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\//;
const FILE_URL = /^[a-z]+:\/\/[^/]+\/(.*\/)?[^/?#]+\.[a-z0-9]+([?#].*)?$/i;
// A repo.json may point at another store; a chain this long is a loop.
const MAX_HOPS = 3;
const NSFW = /^CONTENT_WARNING_(MIXED|NSFW)$/;
const utf8 = new TextDecoder();

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;

// A repo index is third-party: only an http(s) website is kept.
const webUrl = (value: unknown): string | undefined => {
  const url = str(value);
  return url && isWebUrl(url) ? url : undefined;
};

/** The file to read for what a user pastes: a file url as is, a folder's `repo.json`. */
export const repoUrl = (url: string): string => {
  const clean = url
    .trim()
    .replace(/\/+$/, "")
    .replace(GITHUB_RAW, "https://raw.githubusercontent.com/$1/$2/");
  return FILE_URL.test(clean) ? clean : `${clean}/repo.json`;
};

const folder = (url: string) => url.replace(/\/[^/]*$/, "");

const gunzip = (bytes: Uint8Array): Uint8Array => {
  try {
    return gunzipSync(bytes);
  } catch {
    throw new Error(CORRUPT);
  }
};

/**
 * Reads a body over https, gunzipping it when it starts with the gzip magic bytes (plain http could hand over someone's own signing key).
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/service/ExtensionStoreService.kt
 */
const download = async (url: string): Promise<Uint8Array> => {
  if (!/^https:\/\//i.test(url)) throw new Error(HTTPS_ONLY);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Couldn't read ${url} (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzip(bytes) : bytes;
};

const json = (bytes: Uint8Array): unknown => {
  try {
    return JSON.parse(utf8.decode(bytes));
  } catch {
    throw new Error(NOT_A_REPO);
  }
};

// Native reports lowercase hex; normalize so keys compare and install consistently.
const key = (value: unknown) => str(value)?.trim().toLowerCase();

/**
 * A legacy `repo.json`: `meta.name`, `meta.signingKeyFingerprint` and an optional `index_v2`.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkLegacyExtensionRepo.kt
 */
const legacyMeta = (value: unknown) => {
  if (!isObject(value) || !isObject(value.meta)) return undefined;
  const name = str(value.meta.name);
  const signingKey = key(value.meta.signingKeyFingerprint);
  if (!name || !signingKey) return undefined;
  return { name, signingKey, indexV2: str(value.index_v2) };
};

const protobufStore = (body: Uint8Array): Json => {
  try {
    return decodeStore(body);
  } catch {
    throw new Error(NOT_A_REPO);
  }
};

const resolve = async (url: string, hops: number): Promise<Repo> => {
  if (hops > MAX_HOPS) throw new Error(NOT_A_REPO);
  let indexUrl = url;
  let body = await download(url);
  // "[": a v1 list, read through the repo.json next to it.
  if (body[0] === 0x5b) {
    if (!url.endsWith("/index.min.json")) throw new Error(LEGACY_LIST);
    indexUrl = url.replace(/\/index\.min\.json$/, "/repo.json");
    body = await download(indexUrl);
  }
  const value = body[0] === 0x7b ? json(body) : undefined;
  const legacy = legacyMeta(value);
  if (legacy?.indexV2) return resolve(repoUrl(legacy.indexV2), hops + 1);
  const base = { baseUrl: folder(indexUrl), indexUrl };
  if (legacy)
    return {
      ...base,
      name: legacy.name,
      signingKey: legacy.signingKey,
      legacy: true,
    };
  if (indexUrl !== url || body.length === 0) throw new Error(NOT_A_REPO);
  const store = isObject(value) ? value : protobufStore(body);
  const name = str(store.name);
  const signingKey = key(store.signingKey);
  if (!name || !signingKey) throw new Error(NOT_A_REPO);
  const extensionListUrl = str(store.extensionListUrl);
  return {
    ...base,
    name,
    signingKey,
    legacy: false,
    ...(extensionListUrl && { extensionListUrl }),
  };
};

/**
 * Reads a repo from any pasted url by the body's first byte: `[` v1 list, `{` legacy repo.json (following `index_v2`) or JSON store, else protobuf store.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/service/ExtensionStoreService.kt
 */
export const fetchRepo = (url: string): Promise<Repo> =>
  resolve(repoUrl(url), 0);

const parseSources = (value: unknown, langKey: string, homeKey: string) =>
  (Array.isArray(value) ? value : []).flatMap((raw) => {
    if (!isObject(raw)) return [];
    const id = str(raw.id);
    const name = str(raw.name);
    const lang = str(raw[langKey]);
    return id && name && lang
      ? [{ id, name, lang, homeUrl: webUrl(raw[homeKey]) }]
      : [];
  });

/**
 * A v2 store entry, from JSON or protobuf.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkExtensionStore.kt
 */
const parseV2 = (raw: unknown): RepoEntry | undefined => {
  if (!isObject(raw)) return undefined;
  const resources = isObject(raw.resources) ? raw.resources : {};
  const pkg = str(raw.packageName);
  const name = str(raw.name);
  const version = str(raw.versionName);
  const lib = str(raw.extensionLib);
  const apkUrl = str(resources.apkUrl);
  if (!pkg || !name || !version || !lib || !apkUrl) return undefined;
  return {
    pkg,
    name,
    version,
    lib,
    apkUrl,
    iconUrl: str(resources.iconUrl),
    // Unspecified counts as safe, as in Mihon.
    nsfw: NSFW.test(String(raw.contentWarning)),
    sources: parseSources(raw.sources, "language", "homeUrl"),
  };
};

/**
 * A v1 `index.min.json` entry; its APK and icon sit under the repo's folder.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/model/NetworkLegacyExtension.kt
 */
const parseV1 = (raw: unknown, baseUrl: string): RepoEntry | undefined => {
  if (!isObject(raw)) return undefined;
  const pkg = str(raw.pkg);
  const name = str(raw.name);
  const version = str(raw.version);
  const apk = str(raw.apk);
  if (!pkg || !name || !version || !apk) return undefined;
  return {
    pkg,
    name,
    version,
    lib: version.split(".").slice(0, -1).join("."),
    apkUrl: `${baseUrl}/apk/${apk}`,
    iconUrl: `${baseUrl}/icon/${pkg}.png`,
    nsfw: raw.nsfw === 1,
    sources: parseSources(raw.sources, "lang", "baseUrl"),
  };
};

/** Reads either index format by shape, skipping entries that don't validate. */
export const parseIndex = (json: unknown, baseUrl: string): RepoEntry[] => {
  const v2 = isObject(json) && isObject(json.extensionList);
  const list = v2 ? (json.extensionList as Json).extensions : json;
  if (!Array.isArray(list)) return [];
  return list.flatMap((raw) => {
    const entry = v2 ? parseV2(raw) : parseV1(raw, baseUrl);
    return entry ? [entry] : [];
  });
};

/**
 * Lists a repo's extensions: a v2 store's `extensionListUrl` or inline list, a legacy repo's `index.min.json`.
 * @see https://github.com/mihonapp/mihon/blob/main/data/src/main/java/mihon/data/extension/service/ExtensionStoreService.kt
 */
export const fetchIndex = async (repo: Repo): Promise<RepoEntry[]> => {
  if (repo.legacy) {
    const body = await download(`${repo.baseUrl}/index.min.json`);
    return parseIndex(json(body), repo.baseUrl);
  }
  const listUrl = repo.extensionListUrl;
  const body = await download(listUrl ?? repo.indexUrl);
  // Every decoder and the JSON parse yield an extension list, or a store holding one.
  const decoded =
    body[0] === 0x7b
      ? json(body)
      : listUrl
        ? decodeExtensionList(body)
        : decodeStore(body);
  return parseIndex(
    listUrl ? { extensionList: decoded } : decoded,
    repo.baseUrl,
  );
};
