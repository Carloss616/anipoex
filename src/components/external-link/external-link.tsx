import { type Href, Link } from "expo-router";
import type { ReactElement } from "react";

export type ExternalLinkProps = {
  href: string;
  /** Single pressable element. */
  children: ReactElement;
};

/** Plain `Link`: with `asChild` the child becomes the anchor but loses `target`. */
export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <Link target="_blank" href={href as Href}>
      {children}
    </Link>
  );
}
