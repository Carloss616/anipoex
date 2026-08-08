/** Normalized across providers */
export type User = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export type Tracker = {
  id: "anilist";
  /** Resolves to null when the user cancels — that is not an error. */
  authorize(): Promise<{ accessToken: string } | null>;
  fetchViewer(): Promise<User>;
};

/**
 * The token is expired or revoked. Callers must clear the session.
 * Distinct from a network failure, where the token is still good.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("Your AniList token expired or was revoked");
    this.name = "UnauthorizedError";
  }
}
