import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { Icon, Icons } from "@/components/ui/icon";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { openExternal } from "@/utils/open-external";
import { LINKS, VERSION_LABEL } from "./constants";

/** The app's version and where it's made; only Android updates itself. */
export function About() {
  return (
    <SettingsPage title="About">
      <Frame>
        <Frame.Header>
          <Frame.Title>Anipoex</Frame.Title>
        </Frame.Header>
        <Frame.Panel data-attached="column">
          <Frame.Row>
            <Frame.Content>
              <Frame.Title as="p">Version</Frame.Title>
            </Frame.Content>
            <Frame.Actions>
              <Typography type="body-sm" muted>
                {VERSION_LABEL}
              </Typography>
            </Frame.Actions>
          </Frame.Row>
          {LINKS.map((link) => (
            <Frame.Row key={link.url} onClick={() => openExternal(link.url)}>
              <Frame.Media>
                <Icon name={link.icon} muted />
              </Frame.Media>
              <Frame.Content>
                <Frame.Title as="p">{link.label}</Frame.Title>
              </Frame.Content>
              <Frame.Actions>
                <Icon name={Icons.openExternal} size={16} muted />
              </Frame.Actions>
            </Frame.Row>
          ))}
        </Frame.Panel>
      </Frame>
    </SettingsPage>
  );
}
