import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { scoreScale } from "@/features/manga/utils/score-scale";
import { session$ } from "@/state/session";
import { tick } from "@/utils/haptics";

/** The score being picked, on the viewer's own scale. */
export function useScore(value: number) {
  const scale = scoreScale(useValue(session$.user)?.scoreFormat);
  const [score, setScore] = useState(value);

  // The slider reports every frame; the detent is the rounded value.
  const change = (next: number) => {
    const stepped = Number(next.toFixed(scale.step < 1 ? 1 : 0));
    if (stepped === score) return;
    setScore(stepped);
    tick();
  };

  return { scale, score, change };
}
