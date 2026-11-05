import { EmptyState } from "@/components/blocks/empty-state";
import {
  hasSearch,
  type SearchParams,
} from "@/features/manga/utils/search-params";

export function SearchEmpty({
  params,
  error,
  onRetry,
}: {
  params: SearchParams;
  error: boolean;
  onRetry: () => void;
}) {
  if (!hasSearch(params)) {
    return (
      <EmptyState
        title="Search AniList"
        description="Type a title and press search."
      />
    );
  }
  if (error) {
    return (
      <EmptyState
        title="Couldn't search AniList"
        actions={[{ label: "Retry", onPress: onRetry }]}
      />
    );
  }
  return (
    <EmptyState
      title="Nothing on AniList"
      description={
        params.q
          ? `No manga match “${params.q}”.`
          : "No manga match these filters."
      }
    />
  );
}
