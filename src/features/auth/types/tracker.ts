import type { ScoreFormat } from "@/graphql/types.generated";

/** Normalized across providers */
export type User = {
  id: number;
  name: string;
  avatarUrl: string | null;
  /** The scale the user's scores are stored in. Null until it's been fetched. */
  scoreFormat: ScoreFormat | null;
};

export type Tracker = {
  id: "anilist";
  /** Resolves to null when the user cancels — that is not an error. */
  authorize(): Promise<{ accessToken: string } | null>;
  fetchViewer(): Promise<User>;
};
