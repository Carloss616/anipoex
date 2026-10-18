import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { MOCK_SOURCES } from "@/features/manga/sources";
import { source$ } from "@/features/manga/state/source";

/** The picked source and the sheet that changes it. */
export function useSourcePicker(mangaId: number) {
  const [isPresented, setIsPresented] = useState(false);
  const sourceId = useValue(source$[mangaId]);
  const source = MOCK_SOURCES.find((entry) => entry.id === sourceId);

  return {
    label: source?.name ?? "Source",
    sourceId,
    isPresented,
    open: () => setIsPresented(true),
    close: () => setIsPresented(false),
    select: (nextId: string) => {
      source$[mangaId].set(nextId);
      setIsPresented(false);
    },
  };
}
