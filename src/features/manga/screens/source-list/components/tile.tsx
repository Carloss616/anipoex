import { useValue } from "@legendapp/state/react";
import { SourceTile } from "@/features/manga/components/source-tile";
import { type Source, sourceColor } from "@/features/manga/utils/source";
import { themeMode$ } from "@/state/theme";

/** A source's tile in its theme color; reads the mode so its row doesn't. */
export function Tile({
  source,
  loading,
}: {
  source: Source;
  /** While the source scans. */
  loading?: boolean;
}) {
  const mode = useValue(themeMode$);
  return (
    <SourceTile
      initials={source.initials}
      iconUrl={source.iconUrl}
      color={sourceColor(source, mode)}
      loading={loading}
    />
  );
}
