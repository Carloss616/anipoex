import { Text, View } from "react-native";
import type { Extension } from "./data";

const SIZE = {
  sm: { box: "h-8 w-8", text: "text-xs" },
  md: { box: "h-10 w-10", text: "text-sm" },
  lg: { box: "h-14 w-14", text: "text-lg" },
} as const;

export function ExtensionMark({
  extension,
  size = "md",
}: {
  extension: Extension;
  size?: keyof typeof SIZE;
}) {
  const s = SIZE[size];
  return (
    <View
      className={`items-center justify-center rounded-xl ${s.box}`}
      style={{ backgroundColor: `${extension.accent}33` }}
    >
      <Text
        className={`font-semibold ${s.text}`}
        style={{ color: extension.accent }}
      >
        {extension.initials}
      </Text>
    </View>
  );
}
