import { useValue } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Icon, Icons } from "@/components/ui/icon";
import {
  type SearchParams,
  toRouteParams,
} from "@/features/manga/utils/search-params";
import type { RailEdges } from "../hooks/use-rail-scroll";

/**
 * A rail's header actions: Show all, and the arrows when it has them, each
 * off at its end of the rail.
 */
export function SectionActions({
  title,
  params,
  onScroll,
  edges$,
}: {
  title: string;
  params?: SearchParams;
  onScroll?: (direction: 1 | -1) => void;
  /** None, as a carousel that wraps around: the arrows never turn off. */
  edges$?: RailEdges;
}) {
  const router = useRouter();
  const atStart = useValue(() => edges$?.start.get() ?? false);
  const atEnd = useValue(() => edges$?.end.get() ?? false);
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
            disabled={atStart}
            onClick={() => onScroll(-1)}
          >
            <Icon name={Icons.back} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Next in ${title}`}
            disabled={atEnd}
            onClick={() => onScroll(1)}
          >
            <Icon name={Icons.chevronRight} />
          </Button>
        </>
      )}
    </Frame.Action>
  );
}
