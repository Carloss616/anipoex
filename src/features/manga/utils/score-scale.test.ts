import { describe, expect, it } from "bun:test";
import { ScoreFormat } from "@/graphql/types.generated";
import { scoreScale } from "./score-scale";

describe("scoreScale", () => {
  it("uses whole points out of 100", () => {
    expect(scoreScale(ScoreFormat.Point_100)).toMatchObject({
      max: 100,
      step: 1,
    });
  });

  it("uses tenths out of 10 for the decimal format", () => {
    expect(scoreScale(ScoreFormat.Point_10Decimal)).toMatchObject({
      max: 10,
      step: 0.1,
    });
  });

  it("uses whole stars out of 5", () => {
    expect(scoreScale(ScoreFormat.Point_5)).toMatchObject({ max: 5, step: 1 });
  });

  it("falls back to 10 points when the viewer's format is unknown", () => {
    expect(scoreScale(undefined)).toMatchObject({ max: 10, step: 1 });
  });

  it("drops the decimal when the step is whole", () => {
    expect(scoreScale(ScoreFormat.Point_10).format(8)).toBe("8");
    expect(scoreScale(ScoreFormat.Point_10Decimal).format(8.5)).toBe("8.5");
  });

  it("shows an unset score as a dash", () => {
    expect(scoreScale(ScoreFormat.Point_10).format(0)).toBe("—");
  });
});
