import type { TypographyProps } from "panelui-native/components/typography";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { Row } from "@/components/layout/row";
import { Typography } from "../typography";

/**
 * A native `Text` holds only text, so a title or description is split into
 * runs: adjacent strings merged and trimmed — the row's gap spaces them — and
 * elements such as a `Badge` or an icon kept in place between them.
 */
function textRuns(children: ReactNode) {
  const runs: (string | ReactElement)[] = [];
  for (const child of Children.toArray(children)) {
    const prev = runs.at(-1);
    // `toArray` doesn't open fragments: their text would land outside a `Text`.
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.type === Fragment
    )
      runs.push(...textRuns(child.props.children));
    else if (isValidElement(child)) runs.push(child);
    else if (typeof prev === "string") runs[runs.length - 1] = prev + child;
    else runs.push(String(child));
  }
  return runs.flatMap((run): (string | ReactElement)[] =>
    typeof run !== "string" ? [run] : run.trim() ? [run.trim()] : [],
  );
}

/**
 * Plain text stays one `Typography`; mixed with elements, each text run gets
 * its own and the elements sit between them in a row.
 */
export function ItemText({ children, ...props }: TypographyProps) {
  const runs = textRuns(children);
  if (runs.every((run) => typeof run === "string"))
    return <Typography {...props}>{runs.join(" ")}</Typography>;

  return (
    <Row alignment="center" className="gap-1.5">
      {/* `Children.map` keys each run. */}
      {Children.map(runs, (run) =>
        typeof run === "string" ? (
          <Typography {...props}>{run}</Typography>
        ) : (
          run
        ),
      )}
    </Row>
  );
}
