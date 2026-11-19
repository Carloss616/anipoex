import { router } from "expo-router";
import type { SettingsPage } from "@/features/settings/utils/settings-pages";

/**
 * Keeps the split's stack at the index plus one page, so browser back leads
 * to the index. Account is the index itself there. Not `navigate`: it pushes.
 */
export function openPage(href: SettingsPage["href"]) {
  if (router.canDismiss()) router.dismissAll();
  if (href !== "/settings/account") router.push(href);
}
