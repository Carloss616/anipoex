import {
  Button,
  HStack,
  Picker,
  Section,
  Spacer,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityHidden,
  background,
  buttonStyle,
  clipShape,
  fixedSize,
  foregroundStyle,
  frame,
  labelsHidden,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { InfoPopover } from "@/components/ui/info-popover";
import { Loader } from "@/components/ui/loader";
import { ContextMenu } from "@/components/ui/menu";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  FOLDER_HINT,
  HELP_HOW,
  HELP_TITLE,
  INTERVAL_HINT,
  SYNC_FOOTER,
  SYNC_INTERVAL_OPTIONS,
} from "./constants";
import { useSyncSection } from "./hooks/use-sync-section";

const AVATAR = 40;

function Lines({
  title,
  detail,
  danger,
}: {
  title: string;
  detail?: string;
  danger?: boolean;
}) {
  const destructive = useThemeColor("destructive");
  return (
    <VStack alignment="leading" spacing={2}>
      {/* Inside a Button the title would take the tint. */}
      <Text modifiers={[foregroundStyle("primary")]}>{title}</Text>
      {detail ? (
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle(danger ? destructive : "secondary")]}
        >
          {detail}
        </Text>
      ) : null}
    </VStack>
  );
}

/** The folder's mark, in the circle the GitHub row's avatar takes. */
function FolderBadge() {
  const card = useThemeColor("card");
  return (
    <ZStack
      modifiers={[
        frame({ width: AVATAR, height: AVATAR }),
        background(card),
        clipShape("circle"),
      ]}
    >
      <Icon
        name={Icons.folder}
        size={18}
        muted
        modifiers={[accessibilityHidden()]}
      />
    </ZStack>
  );
}

/**
 * iOS: the GitHub row's menu holds Sync now, the gist and Disconnect; its
 * trailing edge only shows state, or Reconnect when access was revoked.
 */
export function SyncSection() {
  const sync = useSyncSection();
  const { account, gist, folder } = sync;
  const rowBackground = useRowBackground();
  const card = useThemeColor("card");
  const primary = useThemeColor("primary");

  return (
    <Section
      modifiers={[rowBackground]}
      header={
        <HStack spacing={2}>
          <Text>Sync</Text>
          <InfoPopover
            label={HELP_TITLE}
            title={HELP_TITLE}
            items={sync.moments}
            note={HELP_HOW}
          />
          {sync.connected && !gist.revoked ? (
            <>
              <Spacer />
              <Button
                onPress={sync.syncNow}
                modifiers={[buttonStyle("borderless")]}
              >
                <Text textStyle="subheadline" weight="medium">
                  Sync now
                </Text>
              </Button>
            </>
          ) : null}
        </HStack>
      }
      footer={<Text>{SYNC_FOOTER}</Text>}
    >
      {account ? (
        <ContextMenu items={gist.menu}>
          <HStack spacing={12} modifiers={ROW_FILL}>
            <ZStack
              modifiers={[
                frame({ width: AVATAR, height: AVATAR }),
                background(card),
                clipShape("circle"),
              ]}
            >
              <Image source={{ uri: account.avatarUrl }} />
            </ZStack>
            <Lines
              title={account.login}
              detail={gist.status}
              danger={gist.failed}
            />
            <Spacer />
            {gist.busy ? (
              <Loader size="sm" />
            ) : gist.revoked ? (
              <Button
                onPress={sync.connect}
                modifiers={[buttonStyle("borderless")]}
              >
                <Text modifiers={[foregroundStyle(primary)]}>Reconnect</Text>
              </Button>
            ) : (
              <Icon name={Icons.check} size={15} muted />
            )}
          </HStack>
        </ContextMenu>
      ) : (
        <Button onPress={sync.connect}>
          <HStack spacing={8} modifiers={ROW_FILL}>
            <Lines title="GitHub" detail="Not connected" />
            <Spacer />
            <Text modifiers={[foregroundStyle(primary)]}>Connect</Text>
          </HStack>
        </Button>
      )}
      {folder?.name ? (
        <ContextMenu items={folder.menu}>
          <HStack spacing={12} modifiers={ROW_FILL}>
            <FolderBadge />
            <Lines
              title={folder.name}
              detail={folder.status}
              danger={folder.failed}
            />
            <Spacer />
            {folder.busy ? (
              <Loader size="sm" />
            ) : (
              <Icon name={Icons.check} size={15} muted />
            )}
          </HStack>
        </ContextMenu>
      ) : folder ? (
        <Button onPress={folder.choose}>
          <HStack spacing={12} modifiers={ROW_FILL}>
            <FolderBadge />
            <Lines title="Folder" detail={FOLDER_HINT} />
            <Spacer />
            <Text modifiers={[foregroundStyle(primary)]}>Choose</Text>
          </HStack>
        </Button>
      ) : null}
      {sync.connected ? (
        <HStack>
          <Lines title="Check for changes" detail={INTERVAL_HINT} />
          <Spacer />
          <Picker
            key={primary}
            label={<Text>Check for changes</Text>}
            selection={sync.interval.minutes}
            onSelectionChange={(minutes: number | null) =>
              minutes !== null && sync.interval.set(minutes)
            }
            modifiers={[labelsHidden(), fixedSize()]}
          >
            {SYNC_INTERVAL_OPTIONS.map((option) => (
              <Text key={option.minutes} modifiers={[tag(option.minutes)]}>
                {option.label}
              </Text>
            ))}
          </Picker>
        </HStack>
      ) : null}
    </Section>
  );
}
