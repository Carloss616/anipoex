import { router } from "expo-router";
import { Frame } from "panelui-web/frame";
import { Icon, Icons } from "@/components/ui/icon";
import { useDownloadsRow } from "./hooks/use-downloads-row";

/** The chapters in the download queue, paused while offline. */
export function DownloadsRow() {
  const { label, offline } = useDownloadsRow();

  return (
    <Frame.Row onClick={() => router.navigate("/settings/activity")}>
      <Frame.Media>
        <Icon name={Icons.download} size={20} />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{label}</Frame.Title>
        {offline && (
          <Frame.Description>Paused until you're back online</Frame.Description>
        )}
      </Frame.Content>
    </Frame.Row>
  );
}
