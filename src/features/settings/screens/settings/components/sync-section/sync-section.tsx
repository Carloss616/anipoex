import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { ConnectSheet } from "./connect-sheet";
import { SYNC_FOOTER } from "./constants";
import { useSyncSection } from "./hooks/use-sync-section";

/** Web: GitHub sync as a Frame; a browser has no folder to sync through. */
export function SyncSection() {
  const sync = useSyncSection();
  const { account } = sync;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Sync</Frame.Title>
        {account && !sync.revoked && (
          <Frame.Action>
            <Button
              variant="ghost"
              size="sm"
              disabled={sync.syncing}
              onClick={sync.syncNow}
            >
              Sync now
            </Button>
          </Frame.Action>
        )}
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {account ? (
          <>
            <Frame.Row>
              <Frame.Media>
                <Avatar src={account.avatarUrl} name={account.login} />
              </Frame.Media>
              <Frame.Content>
                <Frame.Title as="p">{account.login}</Frame.Title>
                <Frame.Description
                  className={sync.failed ? "text-destructive" : undefined}
                >
                  {sync.status}
                </Frame.Description>
              </Frame.Content>
              <Frame.Actions>
                {sync.revoked ? (
                  <Button variant="outline" size="sm" onClick={sync.connect}>
                    Reconnect
                  </Button>
                ) : (
                  <Menu items={sync.menu} align="end">
                    <Button size="icon" variant="ghost" aria-label="More">
                      <Icon name={Icons.more} />
                    </Button>
                  </Menu>
                )}
              </Frame.Actions>
            </Frame.Row>
            {sync.devices.map((device) => (
              <Frame.Row key={device.id}>
                <Frame.Content>
                  <Frame.Title as="p">{device.title}</Frame.Title>
                  {device.detail && (
                    <Frame.Description>{device.detail}</Frame.Description>
                  )}
                </Frame.Content>
              </Frame.Row>
            ))}
          </>
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
      </Frame.Panel>
      <Frame.Footer>
        <Frame.Description>{SYNC_FOOTER}</Frame.Description>
      </Frame.Footer>
      <ConnectSheet />
    </Frame>
  );
}
