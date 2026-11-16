import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Select } from "panelui-web/select";
import { Icon, Icons } from "@/components/ui/icon";
import type { MenuItem } from "@/components/ui/menu";
import { Menu } from "@/components/ui/menu";
import { ConnectSheet } from "./connect-sheet";
import {
  FOLDER_HINT,
  INTERVAL_HINT,
  SYNC_FOOTER,
  SYNC_INTERVAL_OPTIONS,
} from "./constants";
import { useSyncSection } from "./hooks/use-sync-section";
import { SyncHelp } from "./sync-help";

const INTERVAL_ITEMS = SYNC_INTERVAL_OPTIONS.map(({ minutes, label }) => ({
  value: String(minutes),
  label,
}));

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
        <Frame.Action className="flex items-center gap-1">
          <SyncHelp moments={sync.moments} />
          {sync.connected && (
            <Button
              variant="ghost"
              size="sm"
              disabled={gist.busy || folder?.busy}
              onClick={sync.syncNow}
            >
              Sync now
            </Button>
          )}
        </Frame.Action>
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
            <Frame.Media>
              <Avatar fallback={<Icon name={Icons.folder} />} />
            </Frame.Media>
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
        {sync.connected && (
          <Frame.Row>
            <Frame.Content>
              <Frame.Title as="p">Check for changes</Frame.Title>
              <Frame.Description>{INTERVAL_HINT}</Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              <Select
                items={INTERVAL_ITEMS}
                value={String(sync.interval.minutes)}
                onValueChange={(value) =>
                  value && sync.interval.set(Number(value))
                }
              >
                <Select.Trigger variant="ghost" aria-label="Check for changes">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {INTERVAL_ITEMS.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Frame.Actions>
          </Frame.Row>
        )}
        {sync.connected &&
          sync.devices.map((device) => (
            <Frame.Row key={device.id}>
              <Frame.Media>
                <Icon name={device.icon} size={18} muted />
              </Frame.Media>
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
