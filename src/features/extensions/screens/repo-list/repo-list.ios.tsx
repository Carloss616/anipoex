import {
  Button,
  HStack,
  List,
  Section,
  TextField,
  useNativeState,
  VStack,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  buttonStyle,
  disabled,
  foregroundStyle,
  keyboardType,
  lineLimit,
  listRowBackground,
  listStyle,
  onSubmit,
  scrollContentBackground,
  submitLabel,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TrustDialog } from "./components/trust-dialog";
import { useRepoList } from "./hooks/use-repo-list";

/** An inset-grouped list: the URL field on top, the repos below, swipe to remove. */
export function RepoList() {
  const { repos, url$, setUrl, canAdd$, add, pending, dismiss, trust, remove } =
    useRepoList();
  const text = useNativeState("");
  const empty = useValue(() => url$.get() === "");
  const font = useFont();
  const buttonFont = useFont("body", "medium");
  const rowBackground = listRowBackground(useThemeColor("muted"));

  // Trusting a repo clears the url; only that is mirrored, so typing is never rewritten.
  useEffect(() => {
    if (empty) text.value = "";
  }, [empty, text]);

  return (
    <>
      <Stack.Title>Repositories</Stack.Title>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
          ]}
        >
          <Section modifiers={[rowBackground]}>
            <HStack spacing={12}>
              <TextField
                text={text}
                placeholder="Repository URL"
                onTextChange={setUrl}
                modifiers={[
                  keyboardType("url"),
                  textInputAutocapitalization("never"),
                  autocorrectionDisabled(),
                  submitLabel("done"),
                  onSubmit(add),
                  font,
                ]}
              />
              <Computed>
                {() => (
                  <Button
                    label="Add"
                    onPress={add}
                    modifiers={[
                      buttonStyle("borderless"),
                      buttonFont,
                      disabled(!canAdd$.get()),
                    ]}
                  />
                )}
              </Computed>
            </HStack>
          </Section>
          {repos.length > 0 && (
            <Section modifiers={[rowBackground]}>
              <List.ForEach
                data={repos}
                keyExtractor={(repo) => repo.indexUrl}
                onDelete={(indices) => {
                  for (const i of indices) remove(repos[i]);
                }}
              >
                {({ item: repo }) => (
                  <VStack alignment="leading" spacing={2}>
                    <Text weight="medium" modifiers={[lineLimit(1)]}>
                      {repo.name}
                    </Text>
                    <Text
                      textStyle="subheadline"
                      modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
                    >
                      {repo.indexUrl}
                    </Text>
                  </VStack>
                )}
              </List.ForEach>
            </Section>
          )}
        </List>
      </Host>
      <TrustDialog repo={pending} onDismiss={dismiss} onTrust={trust} />
    </>
  );
}
