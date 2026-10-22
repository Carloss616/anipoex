import {
  Button,
  IconButton,
  LazyColumn,
  ListItem,
  OutlinedTextField,
  Row,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  padding,
  semantics,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Memo, useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useFontFamily } from "@/hooks/use-font";
import { TrustDialog } from "./components/trust-dialog";
import { useRepoList } from "./hooks/use-repo-list";

/** The URL field and its Add button on top, one M3 list item per repo below. */
export function RepoList() {
  const { repos, url$, setUrl, canAdd$, add, pending, dismiss, trust, remove } =
    useRepoList();
  const text = useNativeState("");
  const empty = useValue(() => url$.get() === "");
  const fontFamily = useFontFamily("normal");
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  // Trusting a repo clears the url; only that is mirrored, so typing is never rewritten.
  useEffect(() => {
    if (empty) text.value = "";
  }, [empty, text]);

  return (
    <>
      <Stack.Title>Repositories</Stack.Title>
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        <LazyColumn
          modifiers={[fillMaxSize()]}
          contentPadding={{ start: insets.left, end: insets.right }}
        >
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 12 }}
            modifiers={[padding(GUTTER, 8, GUTTER, 8)]}
          >
            <OutlinedTextField
              value={text}
              singleLine
              keyboardOptions={{
                keyboardType: "uri",
                capitalization: "none",
                autoCorrectEnabled: false,
                imeAction: "done",
              }}
              keyboardActions={{ onDone: add }}
              textStyle={{ fontFamily }}
              onValueChange={setUrl}
              modifiers={[weight(1)]}
            >
              <OutlinedTextField.Label>
                <Text>Repository URL</Text>
              </OutlinedTextField.Label>
            </OutlinedTextField>
            <Memo>
              {() => (
                <Button enabled={canAdd$.get()} onClick={add}>
                  <Text style={{ typography: "labelLarge" }}>Add</Text>
                </Button>
              )}
            </Memo>
          </Row>
          <LazyColumn.Items data={repos} keyExtractor={(repo) => repo.indexUrl}>
            {({ item: repo }) => (
              <ListItem colors={{ containerColor: "transparent" }}>
                <ListItem.HeadlineContent>
                  <Text
                    style={{ fontWeight: "500" }}
                    maxLines={1}
                    overflow="ellipsis"
                  >
                    {repo.name}
                  </Text>
                </ListItem.HeadlineContent>
                <ListItem.SupportingContent>
                  <Text
                    style={{ typography: "bodyMedium" }}
                    maxLines={1}
                    overflow="ellipsis"
                  >
                    {repo.indexUrl}
                  </Text>
                </ListItem.SupportingContent>
                <ListItem.TrailingContent>
                  <IconButton
                    onClick={() => remove(repo)}
                    modifiers={[
                      semantics({ contentDescription: `Remove ${repo.name}` }),
                    ]}
                  >
                    <Icon
                      name={Icons.close}
                      size={BUTTON_ICON_SIZE}
                      color="inherit"
                    />
                  </IconButton>
                </ListItem.TrailingContent>
              </ListItem>
            )}
          </LazyColumn.Items>
        </LazyColumn>
      </Host>
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
    </>
  );
}
