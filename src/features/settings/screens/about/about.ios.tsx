import {
  Button,
  HStack,
  Section,
  Spacer,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import { foregroundStyle, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { updates$ } from "@/features/updates/state/updates";
import { openExternal } from "@/utils/open-external";
import { LINKS, VERSION_LABEL } from "./constants";
import { checkStatus, onCheck, toggleUpdateCheck, updateCheck$ } from "./utils";

const SECONDARY = [foregroundStyle("secondary")];

export function About() {
  const rowBackground = useRowBackground();
  const autoCheck = useValue(() => updateCheck$.get() !== false);

  return (
    <SettingsPage title="About">
      <Section modifiers={[rowBackground]} header={<Text>Anipoex</Text>}>
        <HStack>
          <Text>Version</Text>
          <Spacer />
          <Text modifiers={SECONDARY}>{VERSION_LABEL}</Text>
        </HStack>
        <Button onPress={onCheck}>
          <HStack modifiers={ROW_FILL}>
            <VStack alignment="leading" spacing={2}>
              <Text modifiers={[foregroundStyle("primary")]}>
                Check for updates
              </Text>
              <Computed>
                {() => (
                  <Text textStyle="subheadline" modifiers={SECONDARY}>
                    {checkStatus()}
                  </Text>
                )}
              </Computed>
            </VStack>
            <Spacer />
            <Computed>
              {() => (updates$.checking.get() ? <Loader size="sm" /> : null)}
            </Computed>
          </HStack>
        </Button>
        <Toggle
          isOn={autoCheck}
          onIsOnChange={(on) => updateCheck$.set(on)}
          modifiers={[...ROW_FILL, onTapGesture(toggleUpdateCheck)]}
        >
          <Text>Check automatically</Text>
          <Text textStyle="subheadline" modifiers={SECONDARY}>
            Once a day, when you open the app
          </Text>
        </Toggle>
      </Section>
      <Section modifiers={[rowBackground]} header={<Text>Links</Text>}>
        {LINKS.map((link) => (
          <Button key={link.url} onPress={() => openExternal(link.url)}>
            <HStack modifiers={ROW_FILL}>
              <Text modifiers={[foregroundStyle("primary")]}>{link.label}</Text>
              <Spacer />
              <Icon name={Icons.openExternal} size={13} muted />
            </HStack>
          </Button>
        ))}
      </Section>
    </SettingsPage>
  );
}
