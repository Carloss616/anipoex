import { ExtendedFloatingActionButton, Row } from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import {
  CONTINUE_LABEL,
  chapterBadge,
  continueDescription,
} from "@/features/manga/utils/continue-label";
import type { ContinueButtonProps } from "./continue-button";

export function ContinueButton({
  continue$,
  onPress,
  expanded = true,
}: ContinueButtonProps) {
  const action = useValue(continue$);
  if (!action) return null;
  const label = CONTINUE_LABEL[action.kind];
  const badge = chapterBadge(action.chapter?.number);

  return (
    <ExtendedFloatingActionButton
      expanded={expanded}
      onClick={onPress}
      // Expanded, the label reads itself; collapsed, only the icon is left.
      modifiers={
        expanded
          ? []
          : [
              semantics({
                contentDescription: continueDescription(action, label),
              }),
            ]
      }
    >
      <ExtendedFloatingActionButton.Icon>
        <Icon
          name={action.kind === "pick" ? Icons.search : Icons.play}
          size={24}
          color="inherit"
        />
      </ExtendedFloatingActionButton.Icon>
      <ExtendedFloatingActionButton.Text>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
          <Text>{label}</Text>
          {badge && <Badge color="primary">{badge}</Badge>}
        </Row>
      </ExtendedFloatingActionButton.Text>
    </ExtendedFloatingActionButton>
  );
}
