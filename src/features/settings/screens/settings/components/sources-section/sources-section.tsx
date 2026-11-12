import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { Select } from "panelui-web/select";
import { Switch } from "panelui-web/switch";
import { languageName, languageOrder$ } from "@/features/extensions";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS, SLOW_SKIP_OPTIONS } from "../../constants";

const SLOW_SKIP_ITEMS = SLOW_SKIP_OPTIONS.map(({ seconds, label }) => ({
  value: String(seconds),
  label,
}));

export function SourcesSection() {
  const router = useRouter();

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Sources</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {/* A label hands its click to the switch inside. */}
        <Frame.Row
          // biome-ignore lint/a11y/noLabelWithoutControl: the Switch below is its control.
          render={<label />}
        >
          <Frame.Content>
            <Frame.Title as="p">Auto-pick a source</Frame.Title>
            <Frame.Description>{DESCRIPTIONS.autoPick}</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Memo>
              {() => (
                <Switch
                  name="auto-pick-source"
                  label="Auto-pick a source"
                  checked={settings$.sources.autoPick.get()}
                  onCheckedChange={(on) => settings$.sources.autoPick.set(on)}
                />
              )}
            </Memo>
          </Frame.Actions>
        </Frame.Row>
        <Frame.Row>
          <Frame.Content>
            <Frame.Title as="p">Skip slow sources</Frame.Title>
            <Frame.Description>{DESCRIPTIONS.slowSkip}</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Memo>
              {() => (
                <Select
                  items={SLOW_SKIP_ITEMS}
                  value={String(settings$.sources.slowSkip.get())}
                  onValueChange={(value) =>
                    value && settings$.sources.slowSkip.set(Number(value))
                  }
                >
                  <Select.Trigger
                    variant="ghost"
                    aria-label="Skip slow sources"
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {SLOW_SKIP_ITEMS.map((item) => (
                      <Select.Item key={item.value} value={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            </Memo>
          </Frame.Actions>
        </Frame.Row>
        <Frame.Row chevron onClick={() => router.push("/settings/languages")}>
          <Frame.Content>
            <Frame.Title as="p">Languages</Frame.Title>
          </Frame.Content>
          <Frame.Actions className="max-w-1/2">
            <Typography type="body-sm" muted numberOfLines={1}>
              <Memo>
                {() => languageOrder$.get().map(languageName).join(", ")}
              </Memo>
            </Typography>
          </Frame.Actions>
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
