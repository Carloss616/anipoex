import { Item } from "@/components/ui/item";
import { Typography } from "@/components/ui/typography";

export interface SourceTileProps {
  initials: string;
  /** The source's own color, per theme mode. */
  color: string;
}

/** A source's initials on its color, as an item's media. */
export function SourceTile({ initials, color }: SourceTileProps) {
  return (
    <Item.Media variant="icon" style={{ backgroundColor: color }}>
      <Typography type="body-xs" weight="semibold">
        {initials}
      </Typography>
    </Item.Media>
  );
}
