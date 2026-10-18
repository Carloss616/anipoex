import { useState } from "react";

/** @see https://github.com/mihonapp/mihon/blob/main/presentation-core/src/main/java/tachiyomi/presentation/core/screens/EmptyScreen.kt */
const FACES = [
  "(･o･;)",
  "Σ(ಠ_ಠ)",
  "ಥ_ಥ",
  "(˘･_･˘)",
  "(；￣Д￣)",
  "(･Д･。",
  "(╬ಠ益ಠ)",
  "(╥﹏╥)",
  "(⋟﹏⋞)",
  "Ò︵Ó",
  " ˙ᯅ˙)",
  "(¬_¬)",
];

/** One face per mount, so it doesn't change under a re-render. */
export function useFace() {
  const [face] = useState(
    () => FACES[Math.floor(Math.random() * FACES.length)],
  );

  return face;
}
