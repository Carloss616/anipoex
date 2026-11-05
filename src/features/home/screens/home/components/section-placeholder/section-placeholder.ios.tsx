import { RoundedRectangle } from "@expo/ui/swift-ui";
import { foregroundStyle, frame, padding } from "@expo/ui/swift-ui/modifiers";
import { GUTTER } from "@/components/native/constants";
import { SECTIONS } from "@/features/home/constants";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { SectionPlaceholderProps } from "./section-placeholder";

/** Each kind's height while its data loads, so the page doesn't jump. */
const HEIGHT = {
  continue: 90,
  hero: 210,
  rail: 200,
  genres: 138,
  activity: 180,
};

export function SectionPlaceholder({ id }: SectionPlaceholderProps) {
  const skeleton = useThemeColor("skeleton");
  const height = HEIGHT[SECTIONS[id].kind];

  return (
    <RoundedRectangle
      cornerRadius={18}
      modifiers={[
        foregroundStyle(skeleton),
        frame({ maxWidth: Infinity, minHeight: height, maxHeight: height }),
        padding({ horizontal: GUTTER }),
      ]}
    />
  );
}
