import { Frame } from "panelui-web/frame";
import { Icon } from "@/components/ui/icon";

export interface StatusCardProps {
  mode: "offline" | "sending";
}

const COPY = {
  offline: {
    icon: "cloud-off",
    title: "You're offline",
    description:
      "These changes are kept on this device and go out when you're back online.",
  },
  sending: {
    icon: "cloud-upload",
    title: "Back online",
    description: "Sending…",
  },
} as const;

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
