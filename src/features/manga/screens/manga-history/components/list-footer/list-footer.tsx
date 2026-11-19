import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { View } from "react-native";
import { Loader } from "@/components/ui/loader";

export interface ListFooterProps {
  loadingMore: boolean;
  moreFailed: boolean;
  /** No page after the last one loaded. */
  ended: boolean;
  /** Loads the next page; also its retry. */
  onLoadMore: () => void;
}

/** Under the last row: the next page loading, its retry, or the end. */
export function ListFooter({
  loadingMore,
  moreFailed,
  ended,
  onLoadMore,
}: ListFooterProps) {
  return (
    <View className="px-gx items-center gap-2 pt-2 pb-6">
      {loadingMore ? (
        <Loader />
      ) : moreFailed ? (
        <>
          <Typography type="body-sm" muted>
            Couldn't load older activity
          </Typography>
          <Button size="sm" variant="outline" onClick={onLoadMore}>
            Retry
          </Button>
        </>
      ) : ended ? (
        <Typography type="body-sm" muted>
          That's all since you joined AniList
        </Typography>
      ) : null}
    </View>
  );
}
