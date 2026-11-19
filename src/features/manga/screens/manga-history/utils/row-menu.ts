import { router } from "expo-router";
import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";

export const openManga = (mediaId: number) => router.push(`/manga/${mediaId}`);

/** Shows only this manga's activity; `undefined` shows everything again. */
export const filterBy = (mediaId: number | undefined) =>
  router.setParams({ mediaId: mediaId == null ? undefined : String(mediaId) });

/** An activity row's long-press menu; no filter item once filtered. */
export function rowMenu(mediaId: number, filtered: boolean): MenuItem[] {
  return [
    {
      label: "Open manga",
      icon: Icons.chevronRight,
      onPress: () => openManga(mediaId),
    },
    ...(filtered
      ? []
      : [
          {
            label: "Filter by this manga",
            icon: Icons.filter,
            onPress: () => filterBy(mediaId),
          },
        ]),
  ];
}
