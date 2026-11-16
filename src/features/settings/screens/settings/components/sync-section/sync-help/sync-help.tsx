import { Popover } from "@base-ui/react/popover";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { HELP_HOW, HELP_TITLE } from "../constants";

export interface SyncHelpProps {
  /** Each moment a sync runs, one line each. */
  moments: string[];
}

/** An info button whose popup says when a sync runs and how it settles. */
export function SyncHelp({ moments }: SyncHelpProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button size="icon-sm" variant="ghost" aria-label={HELP_TITLE} />
        }
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
            aria-label={HELP_TITLE}
            className="glass-sheet! w-72 origin-(--transform-origin) rounded-xl border p-4 shadow-lg transition-[opacity,scale] duration-150 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
          >
            <View className="gap-2">
              <Typography type="small">{HELP_TITLE}</Typography>
              <View role="list" className="gap-1">
                {moments.map((moment) => (
                  <Typography key={moment} type="body-sm" role="listitem">
                    {`• ${moment}`}
                  </Typography>
                ))}
              </View>
              <Typography type="body-sm" muted>
                {HELP_HOW}
              </Typography>
            </View>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
