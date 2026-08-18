import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { type StyleProp, Text, type TextStyle, View } from "react-native";
import { Badge } from "@/components/ui/badge";

/** The tab's label with its count beside it, in place of the corner badge. */
export function TabLabel({
  title,
  color,
  style,
  count$,
}: {
  title?: string;
  color: string;
  style?: StyleProp<TextStyle>;
  count$: Observable<number | null>;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Text className="font-medium text-sm" style={[style, { color }]}>
        {title}
      </Text>
      {/* // fixed width, so a changing count never resizes the trigger and re-renders every tab */}
      <View className="w-8 items-end">
        <Memo>{() => <Badge>{count$.get() ?? "~"}</Badge>}</Memo>
      </View>
    </View>
  );
}
