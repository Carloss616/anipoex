import { observable } from "@legendapp/state";
import { settings$ } from "@/state/settings";
import {
  languagePriority,
  singleLanguages,
  systemLanguage,
} from "../utils/languages";
import { installed$ } from "./extensions";

/** The installed languages in the user's order, as Settings lists them. */
export const languageOrder$ = observable(() =>
  languagePriority(
    settings$.sources.languages.get(),
    singleLanguages(installed$.get()),
    systemLanguage(),
  ),
);

/** The order sources rank by: the system language last when not installed. */
export const languages$ = observable(() => {
  const order = languageOrder$.get();
  const system = systemLanguage();
  return order.includes(system) ? order : [...order, system];
});
