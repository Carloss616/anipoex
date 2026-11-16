import {
  Button,
  HStack,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityHidden,
  accessibilityLabel,
  buttonStyle,
  foregroundStyle,
  lineLimit,
  opacity,
  padding,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { memo, useState } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Icon, Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { ProgressRing } from "@/components/ui/progress-ring";
import { type DownloadState, downloadProgress$ } from "@/features/downloads";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterDownload } from "./hooks/use-chapter-download";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";
import {
  DELETE_DIALOG,
  downloadItems,
  STATE_ICONS,
} from "./utils/download-items";

/** Tap opens the reader; download actions are behind a swipe and the long-press menu. */
export const ChapterItem = memo(function ChapterItem({
  chapter,
  manga,
  source,
  entryId,
  continue$,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
  const { state, key, actions } = useChapterDownload(manga, source, chapter);
  // Delete confirms in the row's alert, which the swipe opens too.
  const [deleting, setDeleting] = useState(false);
  const items = source
    ? downloadItems(
        state,
        { ...actions, remove: () => setDeleting(true) },
        false,
      )
    : [];
  // The swipe takes the menu's first row.
  const [first] = items;

  const row = (
    <Button
      onPress={() =>
        router.push({
          pathname: "/manga/[id]/reader",
          params: {
            id: manga.id,
            chapter: chapter.id,
          },
        })
      }
      modifiers={[buttonStyle("plain")]}
    >
      {/* A plain button only takes touches on its label, so the
          label fills the row. */}
      <HStack
        spacing={8}
        modifiers={[
          padding({ vertical: 16, horizontal: 16 }),
          ...ROW_FILL,
          ...(read ? [opacity(0.64)] : []),
        ]}
      >
        <VStack alignment="leading" spacing={2}>
          <HStack spacing={6}>
            {read && (
              <HStack spacing={-7}>
                <Icon
                  name={Icons.read}
                  size={12}
                  color={primary}
                  modifiers={[accessibilityLabel("Read")]}
                />
                <Icon
                  name={Icons.read}
                  size={12}
                  color={primary}
                  modifiers={[accessibilityHidden()]}
                />
              </HStack>
            )}
            {next && <Badge color="primary" />}
            <Text weight="medium" modifiers={[lineLimit(1)]}>
              {chapter.title}
            </Text>
          </HStack>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {chapter.date}
          </Text>
        </VStack>
        <Spacer />
        {/* No trigger: a wrapped row would open the alert on every tap. It
            hangs off its own spacer, beside the row's, and only the swipe or
            menu row opens it. */}
        {(state === "local" || state === "cloud") && (
          <Dialog
            {...DELETE_DIALOG}
            alert
            role="destructive"
            open={deleting}
            onOpenChange={setDeleting}
            onConfirm={actions.remove}
          />
        )}
        {next && <Badge color="primary">Next</Badge>}
        <DownloadStatus state={state} progressKey={key} />
      </HStack>
    </Button>
  );

  return (
    <SwipeActions>
      {items.length > 0 ? <ContextMenu items={items}>{row}</ContextMenu> : row}
      {first && (
        <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
          {/* No destructive role: SwiftUI would delete the row before the
              alert confirms. */}
          <Button
            label={first.label}
            systemImage={sfSymbol(first.icon)}
            modifiers={first.destructive ? [tint(destructive)] : []}
            onPress={first.onPress}
          />
        </SwipeActions.Actions>
      )}
    </SwipeActions>
  );
});

const STATUS_LABELS: Record<
  Exclude<DownloadState, "none" | "running">,
  string
> = {
  queued: "Download queued",
  failed: "Download failed",
  local: "Downloaded",
  cloud: "In the cloud",
};

/** State only, no action: the trailing edge of an iOS row. */
function DownloadStatus({
  state,
  progressKey,
}: {
  state: DownloadState;
  progressKey: string;
}) {
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
  if (state === "none") return null;
  if (state === "running") {
    return (
      <Computed>
        {() => (
          <ProgressRing value={downloadProgress$[progressKey].get() ?? 0} />
        )}
      </Computed>
    );
  }
  const label = accessibilityLabel(STATUS_LABELS[state]);
  return (
    <Icon
      name={STATE_ICONS[state]}
      size={16}
      color={
        state === "failed"
          ? destructive
          : state === "local"
            ? primary
            : undefined
      }
      modifiers={[
        label,
        ...(state === "queued" || state === "cloud"
          ? [foregroundStyle("secondary")]
          : []),
      ]}
    />
  );
}
