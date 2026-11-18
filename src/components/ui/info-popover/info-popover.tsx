import { Popover } from "@base-ui/react/popover";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";

export interface InfoPopoverProps {
  /** The button's and the popup's accessible name. */
  label: string;
  /** A heading over the text. */
  title?: string;
  text?: string;
  /** A bulleted list, after `text`. */
  items?: string[];
  /** A muted last paragraph. */
  note?: string;
}

/** An info button that opens a small popup of help text. */
export function InfoPopover({
  label,
  title,
  text,
  items,
  note,
}: InfoPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={<Button size="icon-sm" variant="ghost" aria-label={label} />}
      >
        <Icon name={Icons.info} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50 outline-none"
        >
          <Popover.Popup
            aria-label={label}
            className="glass-sheet! w-72 origin-(--transform-origin) rounded-xl border p-4 shadow-lg transition-[opacity,scale] duration-150 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
          >
            <View className="gap-2">
              {title && <Typography type="small">{title}</Typography>}
              {text && <Typography type="body-sm">{text}</Typography>}
              {items && (
                <View role="list" className="gap-1">
                  {items.map((item) => (
                    <Typography key={item} type="body-sm" role="listitem">
                      {`• ${item}`}
                    </Typography>
                  ))}
                </View>
              )}
              {note && (
                <Typography type="body-sm" muted>
                  {note}
                </Typography>
              )}
            </View>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
