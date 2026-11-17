import { useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import { Frame } from "panelui-web/frame";
import { Icon, Icons } from "@/components/ui/icon";
import { downloadQueue$ } from "@/features/downloads";
import { network$ } from "@/state/network";

/** The chapters in the download queue, paused while offline. */
export function DownloadsRow() {
  const count = useValue(() => Object.keys(downloadQueue$.get(true)).length);
  const offline = useValue(() => !network$.online.get());

  return (
    <Frame.Row onClick={() => router.navigate("/settings/activity")}>
      <Frame.Media>
        <Icon name={Icons.download} size={20} />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{`${count} chapter${count === 1 ? "" : "s"}`}</Frame.Title>
        {offline && (
          <Frame.Description>Paused until you're back online</Frame.Description>
        )}
      </Frame.Content>
    </Frame.Row>
  );
}
