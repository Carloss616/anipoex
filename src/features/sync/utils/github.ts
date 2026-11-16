import type { SyncTarget } from "./sync-tables";

const API = "https://api.github.com";

/** The file that marks a gist as this app's, so any device can find it. */
export const MANIFEST = "anipoex-manifest.json";

/** Why a sync failed, so the Sync section can say what to do. */
export class SyncError extends Error {
  constructor(
    readonly kind: "offline" | "auth" | "other",
    message: string,
  ) {
    super(message);
  }
}

type Fetch = typeof fetch;

interface GistFile {
  content?: string;
  truncated?: boolean;
  raw_url?: string;
}

interface Gist {
  id: string;
  files: Record<string, GistFile | null>;
}

async function send(url: string, init: RequestInit, fetchFn: Fetch) {
  let res: Response;
  try {
    // A browser keeps GitHub's 60 s cache: a just-pushed file would read old.
    res = await fetchFn(url, { ...init, cache: "no-store" });
  } catch {
    throw new SyncError("offline", "No connection to GitHub");
  }
  if (res.status === 401) {
    throw new SyncError("auth", "GitHub access was revoked");
  }
  if (!res.ok) {
    throw Object.assign(
      new SyncError("other", `GitHub answered ${res.status}`),
      { status: res.status },
    );
  }
  return res;
}

/** A GitHub API call: offline and a refused token become a `SyncError`. */
export async function github<T>(
  path: string,
  token: string,
  init: RequestInit = {},
  fetchFn: Fetch = fetch,
): Promise<T> {
  const res = await send(
    `${API}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    },
    fetchFn,
  );
  return res.json() as Promise<T>;
}

/** The signed-in GitHub user, to show in the Sync section. */
export const fetchGitHubUser = (token: string, fetchFn?: Fetch) =>
  github<{ login: string; avatar_url: string }>("/user", token, {}, fetchFn);

/** This app's gist among the user's, or a new private one. */
export async function findOrCreateGist(token: string, fetchFn?: Fetch) {
  for (let page = 1; ; page++) {
    const gists = await github<Gist[]>(
      `/gists?per_page=100&page=${page}`,
      token,
      {},
      fetchFn,
    );
    const found = gists.find((gist) => MANIFEST in gist.files);
    if (found) return found.id;
    if (gists.length < 100) break;
  }
  const created = await github<Gist>(
    "/gists",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        description: "Anipoex sync",
        public: false,
        files: {
          [MANIFEST]: {
            content: `${JSON.stringify({ app: "anipoex", format: 1 }, null, 2)}\n`,
          },
        },
      }),
    },
    fetchFn,
  );
  return created.id;
}

/**
 * The gist as a sync target. `gistId` is read and kept by the caller, so a
 * device finds its gist once; a deleted gist is looked up (or made) again.
 */
export function createGistTarget({
  token,
  gistId,
  fetchFn,
}: {
  token: string;
  gistId: { get(): string | undefined; set(id: string | undefined): void };
  fetchFn?: Fetch;
}): SyncTarget {
  let files: Record<string, GistFile | null> = {};

  const load = async () => {
    let id = gistId.get() ?? (await findOrCreateGist(token, fetchFn));
    gistId.set(id);
    try {
      return {
        id,
        gist: await github<Gist>(`/gists/${id}`, token, {}, fetchFn),
      };
    } catch (error) {
      if ((error as { status?: number }).status !== 404) throw error;
      gistId.set(undefined);
      id = await findOrCreateGist(token, fetchFn);
      gistId.set(id);
      return {
        id,
        gist: await github<Gist>(`/gists/${id}`, token, {}, fetchFn),
      };
    }
  };

  return {
    async list() {
      ({ files } = (await load()).gist);
      return Object.keys(files);
    },
    async read(name) {
      const file = files[name];
      if (!file) return undefined;
      // The API cuts a file's content at 1 MB; the raw URL has it whole.
      if (!file.truncated && file.content != null) return file.content;
      // A secret gist's raw URL needs no token; without headers a browser
      // sends it as is, with no preflight to another host.
      if (!file.raw_url) return undefined;
      return (await send(file.raw_url, {}, fetchFn ?? fetch)).text();
    },
    async write(next) {
      const id = gistId.get() ?? (await load()).id;
      await github(
        `/gists/${id}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            files: Object.fromEntries(
              Object.entries(next).map(([name, content]) => [
                name,
                { content },
              ]),
            ),
          }),
        },
        fetchFn,
      );
    },
  };
}
