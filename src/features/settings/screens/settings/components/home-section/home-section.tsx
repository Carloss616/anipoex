import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { PRESET_LABELS } from "@/features/home/constants";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS } from "../../constants";

export function HomeSection() {
  const router = useRouter();

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Home</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <Frame.Row chevron onClick={() => router.push("/settings/layout")}>
          <Frame.Content>
            <Frame.Title as="p">Layout</Frame.Title>
            <Frame.Description>{DESCRIPTIONS.layout}</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Typography type="body-sm" muted>
              <Memo>{() => PRESET_LABELS[settings$.home.preset.get()]}</Memo>
            </Typography>
          </Frame.Actions>
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
