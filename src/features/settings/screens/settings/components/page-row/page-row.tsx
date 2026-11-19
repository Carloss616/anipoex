import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { Icon } from "@/components/ui/icon";
import {
  PAGE_ICONS,
  PAGE_SUMMARIES,
} from "@/features/settings/utils/page-details";
import type { SettingsPage } from "@/features/settings/utils/settings-pages";

export interface PageRowProps {
  page: SettingsPage;
  /**
   * Its place in the group, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** A page of the index: its icon, title and current value. */
export function PageRow({ page }: PageRowProps) {
  const router = useRouter();
  const summary = PAGE_SUMMARIES[page.id];

  return (
    <Frame.Row chevron onClick={() => router.push(page.href)}>
      <Frame.Media>
        <Icon name={PAGE_ICONS[page.id]} muted />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{page.title}</Frame.Title>
      </Frame.Content>
      {summary && (
        <Frame.Actions className="max-w-1/2">
          <Typography type="body-sm" muted numberOfLines={1}>
            <Memo>{summary}</Memo>
          </Typography>
        </Frame.Actions>
      )}
    </Frame.Row>
  );
}
