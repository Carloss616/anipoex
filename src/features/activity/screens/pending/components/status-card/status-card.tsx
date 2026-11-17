import { Frame } from "panelui-web/frame";
import { Icon } from "@/components/ui/icon";
import { COPY } from "./constants";

export interface StatusCardProps {
  mode: "offline" | "sending";
}

/** Whether what waits is being kept or sent. */
export function StatusCard({ mode }: StatusCardProps) {
  const { icon, title, description } = COPY[mode];

  return (
    <Frame>
      <Frame.Panel data-attached="column">
        <Frame.Row>
          <Frame.Media>
            <Icon name={icon} size={20} />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{title}</Frame.Title>
            <Frame.Description>{description}</Frame.Description>
          </Frame.Content>
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
