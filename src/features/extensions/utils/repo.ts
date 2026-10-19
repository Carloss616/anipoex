export type Repo = { baseUrl: string; name: string; signingKey: string };

export type RepoEntry = {
  pkg: string;
  name: string;
  version: string;
  lib: string;
  apkUrl: string;
  iconUrl?: string;
  nsfw: boolean;
  sources: { id: string; name: string; lang: string }[];
};

const NO_REPO_JSON = "This repository has no repo.json";
const REPO_FILE = /\/(repo\.json|index(\.min)?\.(json|pb))$/;
const GITHUB_RAW = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\//;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;

/** Folder that holds repo.json and the index, from any url a user pastes. */
export const repoBaseUrl = (url: string): string =>
  url
    .trim()
    .replace(REPO_FILE, "")
    .replace(/\/+$/, "")
    .replace(GITHUB_RAW, "https://raw.githubusercontent.com/$1/$2/");

export const parseRepoMeta = (json: unknown, baseUrl: string): Repo => {
  const meta = isObject(json) && isObject(json.meta) ? json.meta : {};
  const name = str(meta.name);
  // Native reports lowercase hex; normalize so keys compare and install consistently.
  const signingKey = str(meta.signingKeyFingerprint)?.trim().toLowerCase();
  if (!name || !signingKey) throw new Error(NO_REPO_JSON);
  return { baseUrl, name, signingKey };
};

const parseSources = (value: unknown, langKey: string) =>
  (Array.isArray(value) ? value : []).flatMap((raw) => {
    if (!isObject(raw)) return [];
    const id = str(raw.id);
    const name = str(raw.name);
    const lang = str(raw[langKey]);
    return id && name && lang ? [{ id, name, lang }] : [];
  });

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
    nsfw: raw.contentWarning !== "CONTENT_WARNING_SAFE",
    sources: parseSources(raw.sources, "language"),
  };
};

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
    sources: parseSources(raw.sources, "lang"),
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

export const fetchRepo = async (url: string): Promise<Repo> => {
  const baseUrl = repoBaseUrl(url);
  // Over plain http, someone on the network could hand over their own signing key.
  if (!/^https:\/\//i.test(baseUrl))
    throw new Error("Repository URLs must use https");
  const response = await fetch(`${baseUrl}/repo.json`);
  if (!response.ok) throw new Error(NO_REPO_JSON);
  const json: unknown = await response.json().catch(() => undefined);
  return parseRepoMeta(json, baseUrl);
};

export const fetchIndex = async (repo: Repo): Promise<RepoEntry[]> => {
  let response = await fetch(`${repo.baseUrl}/index.json`);
  if (response.status === 404) {
    response = await fetch(`${repo.baseUrl}/index.min.json`);
  }
  if (!response.ok)
    throw new Error(`Could not read ${repo.name} (${response.status})`);
  return parseIndex(await response.json(), repo.baseUrl);
};
