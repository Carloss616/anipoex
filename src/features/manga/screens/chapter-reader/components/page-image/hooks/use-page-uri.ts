import { useEffect, useState } from "react";
import { runtime, type SourcePage } from "@/features/extensions";

/**
 * The page's image file: its own when downloaded, else what the source's
 * client fetched (`runtime.pageImage`); none while it downloads.
 */
export function usePageUri(sourceId: string, page: SourcePage) {
  // The failed page: a reload brings new page objects, mounting fresh images.
  const [failed, setFailed] = useState<SourcePage>();
  const [image, setImage] = useState<{ page: SourcePage; uri: string }>();

  useEffect(() => {
    if (page.local) return;
    let current = true;
    runtime.pageImage(sourceId, page).then(
      (uri) => {
        if (current) setImage({ page, uri });
      },
      () => {
        if (current) setFailed(page);
      },
    );
    return () => {
      current = false;
    };
  }, [sourceId, page]);

  const uri = page.local
    ? page.imageUrl
    : image?.page === page
      ? image.uri
      : undefined;
  return { uri, failed: failed === page, fail: () => setFailed(page) };
}
