import { languageName, languageOrder$ } from "@/features/extensions";

/** The chosen languages in order, read with `get()` so a `Memo` tracks them. */
export const languagesLabel = () =>
  languageOrder$.get().map(languageName).join(", ");
