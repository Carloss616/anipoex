import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { memo } from "react";

export interface DayRowProps {
  label: string;
}

/** The top of a day's card; pinned, a glass pill over the rows. */
export const DayRow = memo(function DayRow({ label }: DayRowProps) {
  return (
    <Frame
      className={cn(
        "gutters mx-gx rounded-b-none border-b-0",
        "stuck:glass-chrome! stuck:glass-muted stuck:rounded-full stuck:border stuck:shadow-lg",
      )}
    >
      <Frame.Header>
        <Frame.Title>{label}</Frame.Title>
      </Frame.Header>
    </Frame>
  );
});
