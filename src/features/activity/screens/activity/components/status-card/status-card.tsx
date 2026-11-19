import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";
import { Memo } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Icon } from "@/components/ui/icon";
import { waitingIds } from "@/features/activity/utils/state";
import { resumeDownloads } from "@/features/downloads";
import type { StatusMode } from "../../utils/status";
import { Overview } from "../overview";
import { COPY } from "./constants";
import { sendingLine } from "./utils";

export interface StatusCardProps {
  mode: Exclude<StatusMode, "">;
  /**
   * The section's row background.
   * @platform ios
   */
  modifiers?: ModifierConfig[];
}

/** What the whole queue is doing: kept, sent, paused or scanning. */
export function StatusCard({ mode }: StatusCardProps) {
  if (mode === "reading" || mode === "scans") return <Overview />;

  const { icon, title } = COPY[mode];

  return (
    <Frame>
      <Frame.Panel data-attached="column">
        <Frame.Row>
          <Frame.Media>
            <Icon name={icon} size={20} />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{title}</Frame.Title>
            <Frame.Description className="whitespace-normal!">
              {mode === "sending" ? (
                <Memo>{() => sendingLine(waitingIds())}</Memo>
              ) : (
                COPY[mode].description
              )}
            </Frame.Description>
          </Frame.Content>
          {mode === "paused" && (
            <Frame.Actions>
              <Button variant="ghost" onClick={resumeDownloads}>
                Resume
              </Button>
            </Frame.Actions>
          )}
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
