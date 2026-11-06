import { useRouter } from "expo-router";
import { Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";

/** A tap continues; the context menu offers that and the manga's page. */
export function useContinueActions(
  mangaId: number,
  chapterId: string,
  chapterNumber: number,
) {
  const router = useRouter();
  const read = () =>
    router.push({
      pathname: "/manga/[id]/reader",
      params: { id: mangaId, chapter: chapterId },
    });
  const menu: MenuItem[] = [
    {
      label: `Continue chapter ${chapterNumber}`,
      icon: Icons.play,
      onPress: read,
    },
    {
      label: "Open details",
      icon: Icons.info,
      onPress: () => router.push(`/manga/${mangaId}`),
    },
  ];
  return { read, menu };
}
