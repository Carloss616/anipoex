import { Stack } from "expo-router";
import { View } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { TrustDialog } from "./components/trust-dialog";
import { useRepoList } from "./hooks/use-repo-list";

export function RepoList() {
  const headerScroll = useHeaderScroll();
  const { repos, url, setUrl, canAdd, add, pending, dismiss, trust, remove } =
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
              <Button onPress={add} disabled={!canAdd}>
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
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
    </>
  );
}
