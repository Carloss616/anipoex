import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";

export interface PageCountProps {
  /** The page at the top of the screen, from 1. */
  page$: Observable<number>;
  count: number;
}

/** The page count under the pages, shown with the header. */
export function PageCount({ page$, count }: PageCountProps) {
  if (count === 0) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 bottom-0 items-center py-5.5"
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
