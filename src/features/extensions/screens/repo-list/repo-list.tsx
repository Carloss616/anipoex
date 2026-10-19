import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { toast } from "@/components/ui/toast";
import {
  addRepo,
  fetchRepo,
  loadExtensions,
  type Repo,
  removeRepo,
  repos$,
} from "@/features/extensions";
import { useHeaderScroll } from "@/hooks/use-header-scroll";

const KEY_PREVIEW_LENGTH = 8;

export function RepoList() {
  const repos = useValue(repos$);
  const headerScroll = useHeaderScroll();
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  // The repo fetched and waiting for the user to trust it.
  const [pending, setPending] = useState<Repo>();

  const add = async () => {
    setAdding(true);
    try {
      setPending(await fetchRepo(url));
    } catch (error) {
      toast.destructive(error instanceof Error ? error.message : String(error));
    } finally {
      setAdding(false);
    }
  };

  const trust = (repo: Repo) => {
    addRepo(repo);
    setUrl("");
    void loadExtensions();
  };

  const remove = (repo: Repo) => {
    removeRepo(repo.indexUrl);
    void loadExtensions();
  };

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
            <View className="flex-row items-center gap-3 py-4">
              <Input
                containerClassName="flex-1"
                placeholder="Repository URL"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                onSubmitEditing={add}
              />
              <Button onPress={add} disabled={adding || url.trim() === ""}>
                Add
              </Button>
            </View>
          </HeaderInsetView>
        }
        renderItem={({ item: repo }) => (
          <Item className="px-0">
            <Item.Content>
              <Item.Title numberOfLines={1}>{repo.name}</Item.Title>
              <Item.Description numberOfLines={1}>
                {repo.indexUrl}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button
                size="icon"
                variant="outline"
                className="size-9"
                onPress={() => remove(repo)}
                accessibilityLabel={`Remove ${repo.name}`}
              >
                <Icon
                  name={Icons.close}
                  size={BUTTON_ICON_SIZE}
                  className="text-foreground"
                />
              </Button>
            </Item.Actions>
          </Item>
        )}
      />
      <Dialog
        open={pending !== undefined}
        onOpenChange={(open) => {
          if (!open) setPending(undefined);
        }}
        title={`Trust ${pending?.name}?`}
        description={`Its extensions will run inside the app. Signing key ${pending?.signingKey.slice(0, KEY_PREVIEW_LENGTH)}…`}
        confirmLabel="Trust"
        onConfirm={() => pending && trust(pending)}
      />
    </>
  );
}
