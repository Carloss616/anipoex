import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PageCountProps {
  /** The page at the top of the screen, from 1. */
  page$: Observable<number>;
  count: number;
}

/** The page count under the pages, shown with the header. */
export function PageCount({ page$, count }: PageCountProps) {
  const insets = useSafeAreaInsets();

  if (count === 0) return null;

  return (
    <View
      className="pointer-events-none absolute inset-x-0 items-center"
      style={{ bottom: insets.bottom + 24 }}
    >
      {/* The tab bar's pill. */}
      <div className="rounded-full border border-border bg-surface-secondary px-3 py-1.5 shadow-sm">
        <Typography type="body-xs" muted>
          <Memo>{page$}</Memo> / {count}
        </Typography>
      </div>
    </View>
  );
}
