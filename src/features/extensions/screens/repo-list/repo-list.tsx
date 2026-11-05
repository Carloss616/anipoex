import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Field } from "panelui-web/field";
import { Frame } from "panelui-web/frame";
import { Input } from "panelui-web/input";
import { Sheet } from "panelui-web/sheet";
import { memo, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { AnimatedVisibility } from "@/components/ui/animated-visibility";
import { Badge } from "@/components/ui/badge";
import {
  BottomSheet,
  SHEET_CLOSE_MS,
  SHEET_INSET,
} from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { extensions$, type Repo, repoSummary } from "@/features/extensions";
import { TrustDialog } from "@/features/extensions/components/trust-dialog";
import { useRepoList } from "@/features/extensions/hooks/use-repo-list";
import { repoMenuItems } from "./utils";

export function RepoList() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <BottomSheet
      isPresented={open}
      onDismiss={() => {
        setOpen(false);
        // shortcut: the sheet has no close-end event; leave once it's down.
        setTimeout(() => router.back(), SHEET_CLOSE_MS);
      }}
    >
      <RepoListBody />
    </BottomSheet>
  );
}

function RepoListBody() {
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
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <Sheet.Header className={SHEET_INSET.header}>
        <View className="flex-row items-center justify-between">
          <Sheet.Title>
            Repositories <Badge>{repos.length}</Badge>
          </Sheet.Title>
          <ButtonGroup className="glass-chrome ms-auto rounded-full! border **:rounded-full!">
            <Memo>
              {() => {
                const open = fieldOpen$.get();
                return (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={open ? "Close" : "Add a repository"}
                    aria-expanded={open}
                    onClick={() => {
                      toggleField();
                      // Next tick: the form stays inert until the toggle
                      // renders.
                      if (!open)
                        setTimeout(() =>
                          input.current?.focus({ preventScroll: true }),
                        );
                    }}
                    className={cn(
                      "transition-transform duration-300 ease-sheet",
                      open && "rotate-45",
                    )}
                  >
                    <Icon name={Icons.add} size={BUTTON_ICON_SIZE} />
                  </Button>
                );
              }}
            </Memo>
          </ButtonGroup>
        </View>
      </Sheet.Header>
      <View className="px-4">
        <Memo>
          {() => {
            const error = error$.get();
            const open = fieldOpen$.get();
            return (
              // The error line animates itself: no second resize on top.
              <AnimatedVisibility visible={open} animateResize={false}>
                <form
                  noValidate
                  inert={!open}
                  className="flex flex-col gap-2 pt-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void add();
                  }}
                >
                  <Field invalid={!!error}>
                    <Input.Group
                      aria-label="Add a repository"
                      className="w-full rounded-full"
                    >
                      <Input
                        ref={input}
                        type="url"
                        placeholder="Repository URL"
                        aria-label="Repository URL"
                        value={url$.get()}
                        onChange={(event) => setUrl(event.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                      />
                      <Input.Addon align="end">
                        {filled$.get() && (
                          <Button
                            type="button"
                            size="icon-sm"
                            shape="pill"
                            variant="ghost"
                            aria-label="Clear"
                            onClick={() => {
                              clear();
                              input.current?.focus();
                            }}
                          >
                            <Icon name={Icons.close} size={BUTTON_ICON_SIZE} />
                          </Button>
                        )}
                        <Button
                          type="submit"
                          size="icon-sm"
                          shape="pill"
                          variant="ghost"
                          disabled={!canAdd$.get()}
                          aria-label="Add"
                        >
                          <Icon name={Icons.add} size={BUTTON_ICON_SIZE} />
                        </Button>
                      </Input.Addon>
                    </Input.Group>
                    <Field.Error match={!!error}>{error}</Field.Error>
                  </Field>
                </form>
              </AnimatedVisibility>
            );
          }}
        </Memo>
      </View>
      <LegendList
        recycleItems
        data={repos}
        keyExtractor={(repo) => repo.indexUrl}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        ListEmptyComponent={
          <EmptyState
            title="No repositories"
            description="Add one by its URL to browse its extensions."
          />
        }
        renderItem={({ item: repo }) => (
          <RepoRow repo={repo} onRemove={remove} />
        )}
      />
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
    </>
  );
}

const RepoRow = memo(function RepoRow({
  repo,
  onRemove,
}: {
  repo: Repo;
  onRemove: (repo: Repo) => void;
}) {
  return (
    <Frame.Row className="px-0">
      <Frame.Content>
        <Frame.Title as="p">{repo.name}</Frame.Title>
        <Memo>
          {() => {
            const summary = repoSummary(repo, extensions$.get());
            return summary && <Frame.Description>{summary}</Frame.Description>;
          }}
        </Memo>
      </Frame.Content>
      <Frame.Actions>
        <Menu items={repoMenuItems(repo, () => onRemove(repo))} align="end">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`More actions for ${repo.name}`}
          >
            <Icon name={Icons.more} size={BUTTON_ICON_SIZE} />
          </Button>
        </Menu>
      </Frame.Actions>
    </Frame.Row>
  );
});
