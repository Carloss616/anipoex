import { Alert, Button, ConfirmationDialog, Spacer } from "@expo/ui/swift-ui";
import { useState } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { EnsureHost } from "../host";
import type { DialogProps } from "./dialog";
import { extractTrigger, Trigger } from "./trigger";
import { dialogActions } from "./utils";

/**
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/confirmationdialog/
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/alert/
 */
function DialogRoot(props: DialogProps) {
  const {
    children,
    title,
    description,
    alert = false,
    open,
    onOpenChange,
  } = props;
  const [uncontrolled, setUncontrolled] = useState(false);
  const isOpen = open ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;
  const Root = alert ? Alert : ConfirmationDialog;
  const { actions, cancel } = dialogActions(props);

  return (
    <EnsureHost matchContents>
      <Root
        title={title}
        isPresented={isOpen}
        onIsPresentedChange={setOpen}
        {...(alert ? null : { titleVisibility: "visible" as const })}
      >
        <Root.Trigger>
          {/* Without a trigger the modifier sits on an EmptyView and never presents. */}
          {children ? (
            extractTrigger(children, () => setOpen(true))
          ) : (
            <Spacer minLength={0} />
          )}
        </Root.Trigger>
        <Root.Actions>
          {[...actions, cancel].map((action) => (
            <Button
              key={action.label}
              label={action.label}
              role={action.role}
              onPress={() => {
                setOpen(false);
                action.onPress();
              }}
            />
          ))}
        </Root.Actions>
        {description && (
          <Root.Message>
            <Text>{description}</Text>
          </Root.Message>
        )}
      </Root>
    </EnsureHost>
  );
}

export const Dialog = Object.assign(DialogRoot, { Trigger });
