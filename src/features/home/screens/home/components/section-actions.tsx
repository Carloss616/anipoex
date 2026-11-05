import { useRouter } from "expo-router";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import {
  type SearchParams,
  toRouteParams,
} from "@/features/manga/utils/search-params";

/** A rail's header actions: Show all, and the arrows when it has them. */
export function SectionActions({
  title,
  params,
  onScroll,
}: {
  title: string;
  params?: SearchParams;
  onScroll?: (direction: 1 | -1) => void;
}) {
  const router = useRouter();
  if (!params && !onScroll) return null;

  return (
    <Frame.Action className="flex flex-row items-center gap-1">
      {params && (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Show all: ${title}`}
          onClick={() =>
            router.push({ pathname: "/search", params: toRouteParams(params) })
          }
        >
          Show all
        </Button>
      )}
      {onScroll && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Previous in ${title}`}
            onClick={() => onScroll(-1)}
          >
            <Icon name={Icons.back} size={BUTTON_ICON_SIZE} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Next in ${title}`}
            onClick={() => onScroll(1)}
          >
            <Icon name={Icons.chevronRight} size={BUTTON_ICON_SIZE} />
          </Button>
        </>
      )}
    </Frame.Action>
  );
}
