import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/** The props every Android settings row shares. */
export function useRowProps() {
  const m3 = useThemeM3Colors();

  // Values and switches stay level with the title when a description wraps.
  return {
    colors: { containerColor: m3.surfaceContainerLow },
    verticalAlignment: "center",
  } as const;
}
