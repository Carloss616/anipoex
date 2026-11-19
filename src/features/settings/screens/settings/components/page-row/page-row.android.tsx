import { Computed } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { LeadingIcon } from "@/features/settings/components/leading-icon";
import { useRowProps } from "@/features/settings/hooks/use-row-props";
import {
  PAGE_ICONS,
  PAGE_SUMMARIES,
} from "@/features/settings/utils/page-details";
import type { PageRowProps } from "./page-row";

export function PageRow({ page, index = 0, count = 1 }: PageRowProps) {
  const router = useRouter();
  const row = useRowProps();
  const summary = PAGE_SUMMARIES[page.id];

  return (
    <SegmentedListItem
      index={index}
      count={count}
      {...row}
      onPress={() => router.push(page.href)}
    >
      <SegmentedListItem.Leading>
        <LeadingIcon name={PAGE_ICONS[page.id]} />
      </SegmentedListItem.Leading>
      <Text>{page.title}</Text>
      {/* Kept mounted: a Compose slot added after mount doesn't show. */}
      <SegmentedListItem.Supporting>
        <Computed>
          {() => (
            <Text style={{ typography: "bodyMedium" }}>
              {summary?.() ?? ""}
            </Text>
          )}
        </Computed>
      </SegmentedListItem.Supporting>
    </SegmentedListItem>
  );
}
