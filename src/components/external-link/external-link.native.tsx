import { Children, cloneElement, type ReactElement } from "react";
import { openExternal } from "@/utils/open-external";
import type { ExternalLinkProps } from "./external-link";

/** No `Link`: it needs a `preventDefault` event `asChild` never sends, and its `<Text>` can't hold a Compose view. */
export function ExternalLink({ href, children }: ExternalLinkProps) {
  return cloneElement(
    Children.only(children) as ReactElement<{ onPress?: () => void }>,
    {
      onPress: () => openExternal(href),
    },
  );
}
