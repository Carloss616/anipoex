import { useValue } from "@legendapp/state/react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { badgeCount } from "../utils/badge-count";

/** What waits for the user, on web navigation (tab bar, settings sidebar). */
export function PendingBadge({ className }: { className?: string }) {
  const count = useValue(badgeCount);
  if (!count) return null;

  return (
    // An image role so the label reads in the tab's name.
    <View role="img" aria-label={`${count} pending`} className={className}>
      <Badge color="destructive" solid>
        {count}
      </Badge>
    </View>
  );
}
