import {
  Box,
  Column,
  FilledTonalIconButton,
  IconButton,
  LazyColumn,
  OutlinedTextField,
  Row,
  Spacer,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  clip,
  fillMaxSize,
  fillMaxWidth,
  padding,
  Shapes,
  semantics,
  size,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Memo, useValue } from "@legendapp/state/react";
import { memo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { AnimatedVisibility } from "@/components/ui/animated-visibility";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { extensions$, type Repo, repoSummary } from "@/features/extensions";
import { TrustDialog } from "@/features/extensions/components/trust-dialog";
import { useRepoList } from "@/features/extensions/hooks/use-repo-list";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { repoMenuItems } from "./utils";

export function RepoList() {
  const {
    repos,
    url$,
    setUrl,
    clear,
    canAdd$,
    filled$,
    error$,
    fieldOpen$,
    toggleField,
    add,
    pending,
    dismiss,
    trust,
    remove,
  } = useRepoList();
  const text = useNativeState("");
  const empty = useValue(() => url$.get() === "");
  const fontFamily = useFontFamily("normal");
  const insets = useSafeAreaInsets();
  const m3 = useThemeM3Colors();

  // Trusting a repo clears the url; only that is mirrored, so typing is
  // never rewritten.
  useEffect(() => {
    if (empty) text.value = "";
  }, [empty, text]);

  return (
    <>
      <Host className="flex-1">
        <Column modifiers={[fillMaxSize()]}>
          {/* M3's drag handle, as the other sheets draw it. */}
          <Box
            modifiers={[
              align("centerHorizontally"),
              padding(0, 22, 0, 22),
              size(32, 4),
              clip(Shapes.RoundedCorner(2)),
              background(m3.onSurfaceVariant),
            ]}
          />
          <Column modifiers={[padding(insets.left, 0, insets.right, 0)]}>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
              modifiers={[padding(GUTTER, 0, GUTTER, 16)]}
            >
              <Text style={{ typography: "titleLarge" }}>Repositories</Text>
              {/* M3's badge reads high against a centered title. */}
              <Box modifiers={[padding(0, 4, 0, 0)]}>
                <Badge>{repos.length}</Badge>
              </Box>
              <Spacer modifiers={[weight(1)]} />
              <Memo>
                {() => {
                  const open = fieldOpen$.get();
                  return (
                    <FilledTonalIconButton
                      onClick={toggleField}
                      modifiers={[
                        semantics({
                          contentDescription: open
                            ? "Close"
                            : "Add a repository",
                        }),
                      ]}
                    >
                      <Icon
                        name={open ? Icons.close : Icons.add}
                        size={BUTTON_ICON_SIZE}
                        color="inherit"
                      />
                    </FilledTonalIconButton>
                  );
                }}
              </Memo>
            </Row>
            <Memo>
              {() => {
                const error = error$.get();
                return (
                  <AnimatedVisibility visible={fieldOpen$.get()}>
                    <OutlinedTextField
                      value={text}
                      singleLine
                      autoFocus
                      keyboardOptions={{
                        keyboardType: "uri",
                        capitalization: "none",
                        autoCorrectEnabled: false,
                        imeAction: "done",
                      }}
                      keyboardActions={{ onDone: add }}
                      textStyle={{ fontFamily }}
                      onValueChange={setUrl}
                      isError={!!error}
                      modifiers={[
                        fillMaxWidth(),
                        padding(GUTTER, 0, GUTTER, 16),
                      ]}
                    >
                      <OutlinedTextField.Label>
                        <Text>Repository URL</Text>
                      </OutlinedTextField.Label>
                      <OutlinedTextField.TrailingIcon>
                        <Row verticalAlignment="center">
                          {filled$.get() && (
                            <IconButton
                              onClick={clear}
                              modifiers={[
                                semantics({ contentDescription: "Clear" }),
                              ]}
                            >
                              <Icon
                                name={Icons.close}
                                size={BUTTON_ICON_SIZE}
                                color="inherit"
                              />
                            </IconButton>
                          )}
                          <IconButton
                            enabled={canAdd$.get()}
                            onClick={add}
                            modifiers={[
                              semantics({ contentDescription: "Add" }),
                            ]}
                          >
                            <Icon
                              name={Icons.add}
                              size={BUTTON_ICON_SIZE}
                              color="inherit"
                            />
                          </IconButton>
                        </Row>
                      </OutlinedTextField.TrailingIcon>
                      {!!error && (
                        <OutlinedTextField.SupportingText>
                          <Text style={{ typography: "bodySmall" }}>
                            {error}
                          </Text>
                        </OutlinedTextField.SupportingText>
                      )}
                    </OutlinedTextField>
                  </AnimatedVisibility>
                );
              }}
            </Memo>
          </Column>
          <LazyColumn
            modifiers={[weight(1)]}
            contentPadding={{ start: insets.left, end: insets.right }}
          >
            <LazyColumn.Items
              data={repos}
              keyExtractor={(repo) => repo.indexUrl}
            >
              {({ item: repo, index }) => (
                <RepoRow
                  repo={repo}
                  index={index}
                  count={repos.length}
                  onRemove={remove}
                />
              )}
            </LazyColumn.Items>
            {repos.length === 0 && (
              <EmptyState
                title="No repositories"
                description="Add one by its URL to browse its extensions."
              />
            )}
          </LazyColumn>
        </Column>
      </Host>
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
    </>
  );
}

const RepoRow = memo(function RepoRow({
  repo,
  index,
  count,
  onRemove,
}: {
  repo: Repo;
  index: number;
  count: number;
  onRemove: (repo: Repo) => void;
}) {
  const m3 = useThemeM3Colors();
  // A string, so the row re-renders only when the count changes.
  const summary = useValue(() => repoSummary(repo, extensions$.get()));
  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      {/* No tap of its own: a tap opens the menu as a long press does. */}
      <ContextMenu items={repoMenuItems(repo, () => onRemove(repo))}>
        <SegmentedListItem
          index={index}
          count={count}
          containerColor={m3.surfaceContainerHigh}
        >
          <Text style={{ fontWeight: "500" }} maxLines={1} overflow="ellipsis">
            {repo.name}
          </Text>
          {summary && (
            <SegmentedListItem.Supporting>
              <Text
                style={{ typography: "bodyMedium" }}
                maxLines={1}
                overflow="ellipsis"
              >
                {summary}
              </Text>
            </SegmentedListItem.Supporting>
          )}
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
