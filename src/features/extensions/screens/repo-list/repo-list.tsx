import { Memo } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Frame } from "panelui-web/frame";
import { Input } from "panelui-web/input";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { TrustDialog } from "./components/trust-dialog";
import { useRepoList } from "./hooks/use-repo-list";

export function RepoList() {
  const headerScroll = useHeaderScroll();
  const { repos, url$, setUrl, canAdd$, add, pending, dismiss, trust, remove } =
    useRepoList();

  return (
    <>
      <Stack.Title>Repositories</Stack.Title>
      <LegendList
        recycleItems
        data={repos}
        keyExtractor={(repo) => repo.indexUrl}
        keyboardShouldPersistTaps="handled"
        {...headerScroll}
        contentContainerClassName="gutters px-gx pb-gb"
        ListHeaderComponent={
          <HeaderInsetView>
            <Memo>
              {() => (
                // A form, so Enter in the field adds as the button does.
                <form
                  noValidate
                  className="py-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void add();
                  }}
                >
                  <ButtonGroup aria-label="Add a repository" className="w-full">
                    <Input
                      type="url"
                      placeholder="Repository URL"
                      aria-label="Repository URL"
                      value={url$.get()}
                      onChange={(event) => setUrl(event.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <Button type="submit" disabled={!canAdd$.get()}>
                      Add
                    </Button>
                  </ButtonGroup>
                </form>
              )}
            </Memo>
          </HeaderInsetView>
        }
        renderItem={({ item: repo }) => (
          <Frame.Row className="px-0">
            <Frame.Content>
              <Frame.Title as="p">{repo.name}</Frame.Title>
              <Frame.Description>{repo.indexUrl}</Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              <Button
                size="icon"
                variant="outline"
                onClick={() => remove(repo)}
                aria-label={`Remove ${repo.name}`}
              >
                <Icon name={Icons.close} size={BUTTON_ICON_SIZE} />
              </Button>
            </Frame.Actions>
          </Frame.Row>
        )}
      />
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
    </>
  );
}
