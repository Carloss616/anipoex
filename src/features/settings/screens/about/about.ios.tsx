import { Button, HStack, Section, Spacer } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { openExternal } from "@/utils/open-external";
import { LINKS, VERSION_LABEL } from "./constants";

export function About() {
  const rowBackground = useRowBackground();

  return (
    <SettingsPage title="About">
      <Section modifiers={[rowBackground]} header={<Text>Anipoex</Text>}>
        <HStack>
          <Text>Version</Text>
          <Spacer />
          <Text modifiers={[foregroundStyle("secondary")]}>
            {VERSION_LABEL}
          </Text>
        </HStack>
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
