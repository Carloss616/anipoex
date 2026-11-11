import {
  Button,
  HStack,
  List,
  Section,
  Spacer,
  SwipeActions,
  TextField,
  useNativeState,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  autocorrectionDisabled,
  buttonBorderShape,
  buttonStyle,
  disabled,
  foregroundStyle,
  frame,
  keyboardType,
  labelStyle,
  lineLimit,
  listRowBackground,
  listStyle,
  onSubmit,
  padding,
  scrollContentBackground,
  submitLabel,
  textInputAutocapitalization,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { memo, useEffect, useState } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { TextFieldGroup } from "@/components/native/swift-ui/text-field-group";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Host } from "@/components/ui/host";
import { Icon, Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { SheetToastHost } from "@/components/ui/toast";
import { extensions$, type Repo, repoSummary } from "@/features/extensions";
import { TrustDialog } from "@/features/extensions/components/trust-dialog";
import { useRepoList } from "@/features/extensions/hooks/use-repo-list";
import { useThemeColor } from "@/hooks/use-theme-color";
import { openExternal } from "@/utils/open-external";
import { copyRepoUrl, removeRepoDialog, repoMenuItems } from "./utils";

export function RepoList() {
  const {
    repos,
    url$,
    setUrl,
    clear,
    canAdd$,
    error$,
    fieldOpen$,
    toggleField,
    add,
    pending,
    dismiss,
    trust,
    remove,
  } = useRepoList();
  const [surfaceSecondary, destructive] = useThemeColor([
    "surface-secondary",
    "destructive",
  ]);
  const text = useNativeState("");
  const empty = useValue(() => url$.get() === "");
  const fieldOpen = useValue(fieldOpen$);
  const error = useValue(error$);
  const font = useFont();
  const bgSurface = listRowBackground(surfaceSecondary);
  const bgTransparent = listRowBackground("transparent");

  // Trusting a repo clears the url; only that is mirrored, so typing is
  // never rewritten.
  useEffect(() => {
    if (empty) text.value = "";
  }, [empty, text]);

  return (
    <>
      <Host className="flex-1">
        <VStack alignment="leading" spacing={16}>
          <VStack
            alignment="leading"
            spacing={16}
            // 10: the grabber's room, as `BottomSheet` leaves it.
            modifiers={[padding({ top: 10 + GUTTER, horizontal: GUTTER })]}
          >
            <HStack spacing={8}>
              <Text textStyle="title3">Repositories</Text>
              <Badge>{repos.length}</Badge>
              <Spacer />
              <Button
                onPress={toggleField}
                modifiers={[
                  buttonStyle("glass"),
                  buttonBorderShape("circle"),
                  labelStyle("iconOnly"),
                  foregroundStyle("secondary"),
                  accessibilityLabel(fieldOpen ? "Close" : "Add a repository"),
                ]}
              >
                <Icon
                  name={fieldOpen ? Icons.close : Icons.add}
                  color="inherit"
                  modifiers={[frame({ width: 20, height: 20 })]}
                />
              </Button>
            </HStack>
            {fieldOpen && (
              <VStack alignment="leading" spacing={8}>
                <TextFieldGroup
                  clearAction={clear}
                  showClear={!empty}
                  suffix={
                    <Computed>
                      {() => (
                        <Button
                          onPress={add}
                          modifiers={[
                            buttonStyle("borderless"),
                            accessibilityLabel("Add"),
                            disabled(!canAdd$.get()),
                          ]}
                        >
                          <Icon name={Icons.add} color="inherit" />
                        </Button>
                      )}
                    </Computed>
                  }
                >
                  <TextField
                    text={text}
                    placeholder="Repository URL"
                    onTextChange={setUrl}
                    autoFocus
                    modifiers={[
                      keyboardType("url"),
                      textInputAutocapitalization("never"),
                      autocorrectionDisabled(),
                      submitLabel("done"),
                      onSubmit(add),
                      font,
                    ]}
                  />
                </TextFieldGroup>
                {error && (
                  <Text modifiers={[foregroundStyle(destructive)]}>
                    {error}
                  </Text>
                )}
              </VStack>
            )}
          </VStack>
          <List
            modifiers={[
              listStyle("insetGrouped"),
              scrollContentBackground("hidden"),
              font,
            ]}
          >
            {repos.length > 0 ? (
              <Section modifiers={[bgSurface]} title="Available">
                <List.ForEach
                  data={repos}
                  keyExtractor={(repo) => repo.indexUrl}
                  recycling={false}
                >
                  {({ item: repo }) => (
                    <RepoRow
                      repo={repo}
                      onRemove={remove}
                      destructive={destructive}
                    />
                  )}
                </List.ForEach>
              </Section>
            ) : (
              <Section modifiers={[bgTransparent]}>
                <EmptyState
                  title="No repositories"
                  description="Add one by its URL to browse its extensions."
                />
              </Section>
            )}
          </List>
        </VStack>
      </Host>
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
      <SheetToastHost />
    </>
  );
}

const RepoRow = memo(function RepoRow({
  repo,
  onRemove,
  destructive,
}: {
  repo: Repo;
  onRemove: (repo: Repo) => void;
  destructive: string;
}) {
  const [removing, setRemoving] = useState(false);
  const { website } = repo;

  const websiteButton = website && (
    <Button
      label="Website"
      systemImage="safari"
      onPress={() => openExternal(website)}
    />
  );

  return (
    <SwipeActions>
      <ContextMenu items={repoMenuItems(repo, () => setRemoving(true), false)}>
        <Dialog
          {...removeRepoDialog(repo)}
          alert
          role="destructive"
          open={removing}
          onOpenChange={setRemoving}
          onConfirm={() => onRemove(repo)}
        >
          <Dialog.Trigger>
            <VStack alignment="leading" spacing={2} modifiers={ROW_FILL}>
              <Text weight="medium" modifiers={[lineLimit(1)]}>
                {repo.name}
              </Text>
              <Computed>
                {() => {
                  const summary = repoSummary(repo, extensions$.get());
                  return (
                    summary && (
                      <Text
                        textStyle="subheadline"
                        modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
                      >
                        {summary}
                      </Text>
                    )
                  );
                }}
              </Computed>
            </VStack>
          </Dialog.Trigger>
        </Dialog>
      </ContextMenu>
      <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
        <Button
          label="Remove"
          systemImage={sfSymbol(Icons.trash)}
          // No destructive role: SwiftUI would drop the row before confirming.
          modifiers={[tint(destructive)]}
          onPress={() => setRemoving(true)}
        />
      </SwipeActions.Actions>
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label="Copy"
          systemImage={sfSymbol(Icons.copy)}
          onPress={() => copyRepoUrl(repo)}
        />
        {websiteButton}
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
