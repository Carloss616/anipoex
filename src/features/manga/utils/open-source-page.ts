import { toast } from "@/components/ui/toast";
import { runtime } from "@/features/extensions";
import { openExternal } from "@/utils/open-external";

/** Opens the manga's page on the source's site, or says it couldn't. */
export async function openSourcePage(sourceId: string, url: string) {
  const page = await runtime.mangaWebUrl(sourceId, url).catch(() => null);
  if (!page || !openExternal(page))
    toast.destructive("Couldn't open this manga's page");
}
