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
