import { ScoreFormat } from "@/graphql/types.generated";

const SCALES = {
  [ScoreFormat.Point_100]: { max: 100, step: 1 },
  [ScoreFormat.Point_10Decimal]: { max: 10, step: 0.1 },
  [ScoreFormat.Point_10]: { max: 10, step: 1 },
  [ScoreFormat.Point_5]: { max: 5, step: 1 },
  [ScoreFormat.Point_3]: { max: 3, step: 1 },
} as const satisfies Record<ScoreFormat, { max: number; step: number }>;

const FALLBACK = SCALES[ScoreFormat.Point_10];

/**
 * Scores are stored and saved in the viewer's own format, so the bounds come
 * from `scoreFormat`. Falls back to 10 points until the viewer is fetched.
 */
export function scoreScale(format: ScoreFormat | null | undefined) {
  const { max, step } = (format && SCALES[format]) || FALLBACK;

  return {
    max,
    step,
    format: (score: number) =>
      score === 0
        ? "—"
        : step < 1
          ? score.toFixed(1)
          : String(Math.round(score)),
  };
}
