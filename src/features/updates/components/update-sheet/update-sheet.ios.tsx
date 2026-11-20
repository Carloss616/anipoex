import { Button, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  foregroundStyle,
  frame,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Linking } from "react-native";
import { Text } from "@/components/native/swift-ui/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { openExternal } from "@/utils/open-external";
import { updates$ } from "../../state/updates";
import type { Update } from "../../utils/release";
import { type Store, useStore } from "./hooks/use-store";
import { ReleaseNotes } from "./release-notes";
import { megabytes } from "./utils";

const SECONDARY = [foregroundStyle("secondary")];
const close = () => updates$.open.set(false);

/**
 * The store installs the IPA over the app, keeping its data; without one,
 * the release page offers the file. The browser opens over the sheet:
 * started while the sheet closes, it never showed.
 * @see https://github.com/SideStore/SideStore/blob/develop/SideStore/DeepLinks/URLHandler.swift
 * @see https://github.com/altstoreio/AltStore/blob/master/AltStore/AppDelegate.swift
 */
function install(update: Update, store: Store | undefined) {
  if (!store) {
    openExternal(update.url);
    return;
  }
  Linking.openURL(
    `${store.scheme}://install?url=${encodeURIComponent(update.fileUrl)}`,
  ).then(close, () => openExternal(update.url));
}

export function UpdateSheet() {
  const open = useValue(updates$.open);
  const update = useValue(updates$.available);
  const store = useStore(open);

  return (
    <BottomSheet
      isPresented={open && !!update}
      onDismiss={close}
      snapPoints={["half", "full"]}
    >
      {update ? (
        <ScrollView>
          <VStack
            alignment="leading"
            spacing={16}
            modifiers={[
              padding({ all: 16 }),
              frame({ maxWidth: Infinity, alignment: "leading" }),
            ]}
          >
            <VStack alignment="leading" spacing={2}>
              <Text textStyle="title3" weight="semibold">
                Update available
              </Text>
              <Text textStyle="subheadline" modifiers={SECONDARY}>
                {`Anipoex ${update.version} · ${megabytes(update.fileSize)}`}
              </Text>
            </VStack>
            <VStack spacing={4}>
              <Button
                onPress={() => install(update, store)}
                modifiers={[
                  buttonStyle("borderedProminent"),
                  buttonBorderShape("capsule"),
                  controlSize("large"),
                ]}
              >
                <Text modifiers={[frame({ maxWidth: Infinity })]}>
                  {store ? `Update in ${store.name}` : "Download from GitHub"}
                </Text>
              </Button>
              {store ? (
                <Button
                  onPress={() => openExternal(update.url)}
                  modifiers={[buttonStyle("borderless"), controlSize("large")]}
                >
                  <Text modifiers={[frame({ maxWidth: Infinity })]}>
                    View on GitHub
                  </Text>
                </Button>
              ) : null}
            </VStack>
            <ReleaseNotes markdown={update.notes} />
          </VStack>
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}
