import { Platform } from "react-native";

// ponytail: dp copies of global.css's native `gutters` (`--spacing` = 4dp); keep them in step.

/** Page inset on each side, `--spacing-gx`. */
export const GUTTER_X = 16;

/** Room above the first content under a large title, `--spacing-gt`. */
export const GUTTER_TOP = Platform.OS === "android" ? 24 : 8;

/** Breathing room below the last item, `--spacing-gb`. */
export const GUTTER_BOTTOM = 16;
