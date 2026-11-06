import { useValue } from "@legendapp/state/react";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import {
  CONTINUE_LABEL,
  chapterBadge,
} from "@/features/manga/utils/continue-label";
import type { Continue$ } from "../../hooks/use-continue";

export interface ContinueButtonProps {
  continue$: Continue$;
  onPress: () => void;
  /**
   * Shows the label, else only the icon.
   * @platform android
   */
  expanded?: boolean;
  className?: string;
}

export function ContinueButton({
  continue$,
  onPress,
  className,
}: ContinueButtonProps) {
  const action = useValue(continue$);
  if (!action) return null;
  const badge = chapterBadge(action.chapter?.number);

  return (
    <Button
      size="lg"
      shape="pill"
      onClick={onPress}
      className={cn("gap-2", className)}
    >
      <Icon name={action.kind === "pick" ? Icons.search : Icons.play} />
      {CONTINUE_LABEL[action.kind]}
      {badge && (
        <Badge className="bg-primary-foreground/15 text-primary-foreground">
          {badge}
        </Badge>
      )}
    </Button>
  );
}
