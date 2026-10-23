import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";

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
      <Surface variant="secondary" className="px-3 py-1.5" bordered elevated>
        <Typography type="body-xs" muted>
          <Memo>{page$}</Memo> / {count}
        </Typography>
      </Surface>
    </View>
  );
}
