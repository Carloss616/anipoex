import { useValue } from "@legendapp/state/react";
import { SourceTile } from "@/features/manga/components/source-tile";
import { type Source, sourceColor } from "@/features/manga/utils/source";
import { theme$ } from "@/state/theme";

/** A source's tile in its theme color; reads the mode itself, so a row doesn't. */
export function Tile({ source }: { source: Source }) {
  const mode = useValue(theme$.mode);
  return (
    <SourceTile
      initials={source.initials}
      iconUrl={source.iconUrl}
      color={sourceColor(source, mode)}
    />
  );
}
