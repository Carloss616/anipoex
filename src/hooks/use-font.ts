import type { Theme } from "expo-router";
import type { TextStyle } from "react-native";
import { useCSSVariable } from "uniwind";
import type { TypographyWeight } from "@/components/ui/typography";

const VAR = {
  normal: "--font-normal",
  medium: "--font-medium",
  semibold: "--font-semibold",
  bold: "--font-bold",
} as const satisfies Record<TypographyWeight, string>;

const FROM_STYLE: Record<string, TypographyWeight> = {
  "100": "normal",
  "200": "normal",
  "300": "normal",
  "400": "normal",
  "500": "medium",
  "600": "semibold",
  "700": "bold",
  "800": "bold",
  "900": "bold",
  normal: "normal",
  bold: "bold",
};

export function useFontFamily(
  weight: TypographyWeight | TextStyle["fontWeight"],
) {
  const resolved = FROM_STYLE[String(weight)] ?? (weight as TypographyWeight);

  return useCSSVariable(VAR[resolved] ?? VAR.normal) as string | undefined;
}

export function useNavigationFonts(): Theme["fonts"] {
  const [normal, medium, semibold, bold] = useCSSVariable([
    VAR.normal,
    VAR.medium,
    VAR.semibold,
    VAR.bold,
  ]) as string[];

  return {
    regular: { fontFamily: normal, fontWeight: "400" },
    medium: { fontFamily: medium, fontWeight: "500" },
    bold: { fontFamily: semibold, fontWeight: "600" },
    heavy: { fontFamily: bold, fontWeight: "700" },
  };
}
