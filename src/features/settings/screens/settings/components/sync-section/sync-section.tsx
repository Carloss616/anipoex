import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Icon, Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import { Menu } from "@/components/ui/menu";
import { ConnectSheet } from "./connect-sheet";
import { FOLDER_HINT, SYNC_FOOTER } from "./constants";
import { useSyncSection } from "./hooks/use-sync-section";

function More({ items }: { items: MenuItem[] }) {
  return (
    <Menu items={items} align="end">
      <Button size="icon" variant="ghost" aria-label="More">
        <Icon name={Icons.more} />
      </Button>
    </Menu>
  );
}

/** Web: GitHub sync as a Frame; desktop adds a synced folder. */
export function SyncSection() {
  const sync = useSyncSection();
  const { account, gist, folder } = sync;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Sync</Frame.Title>
        {sync.connected && (
          <Frame.Action>
            <Button
              variant="ghost"
              size="sm"
              disabled={gist.busy || folder?.busy}
              onClick={sync.syncNow}
            >
              Sync now
            </Button>
          </Frame.Action>
        )}
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {account ? (
          <Frame.Row>
            <Frame.Media>
              <Avatar src={account.avatarUrl} name={account.login} />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title as="p">{account.login}</Frame.Title>
              <Frame.Description
                className={gist.failed ? "text-destructive" : undefined}
              >
                {gist.status}
              </Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              {gist.revoked ? (
                <Button variant="outline" size="sm" onClick={sync.connect}>
                  Reconnect
                </Button>
              ) : (
                <More items={gist.menu} />
              )}
            </Frame.Actions>
          </Frame.Row>
        ) : (
          <Frame.Row>
            <Frame.Content>
              <Frame.Title as="p">GitHub</Frame.Title>
              <Frame.Description>Not connected</Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              <Button variant="outline" size="sm" onClick={sync.connect}>
                Connect
              </Button>
            </Frame.Actions>
          </Frame.Row>
        )}
        {folder && (
          <Frame.Row>
            <Frame.Content>
              <Frame.Title as="p">{folder.name ?? "Folder"}</Frame.Title>
              <Frame.Description
                className={folder.failed ? "text-destructive" : undefined}
              >
                {folder.name ? folder.status : FOLDER_HINT}
              </Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              {folder.name ? (
                <More items={folder.menu} />
              ) : (
                <Button variant="outline" size="sm" onClick={folder.choose}>
                  Choose…
                </Button>
              )}
            </Frame.Actions>
          </Frame.Row>
        )}
        {sync.connected &&
          sync.devices.map((device) => (
            <Frame.Row key={device.id}>
              <Frame.Content>
                <Frame.Title as="p">{device.title}</Frame.Title>
                {device.detail && (
                  <Frame.Description>{device.detail}</Frame.Description>
                )}
              </Frame.Content>
            </Frame.Row>
          ))}
      </Frame.Panel>
      <Frame.Footer>
        <Frame.Description>{SYNC_FOOTER}</Frame.Description>
      </Frame.Footer>
      <ConnectSheet />
    </Frame>
  );
}
