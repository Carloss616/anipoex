import { type IconName, Icons } from "@/components/ui/icon";
import { REPO_URL } from "@/features/updates/constants";
import { APP_COMMIT, APP_VERSION } from "@/features/updates/state/updates";

/** `0.2.0 (abc1234)` for a release build. */
export const VERSION_LABEL = [
  APP_VERSION,
  APP_COMMIT && `(${APP_COMMIT})`,
  __DEV__ && "· development",
]
  .filter(Boolean)
  .join(" ");

export const LINKS: { label: string; url: string; icon: IconName }[] = [
  { label: "Release notes", url: `${REPO_URL}/releases`, icon: Icons.history },
  { label: "Source code", url: REPO_URL, icon: Icons.website },
];
