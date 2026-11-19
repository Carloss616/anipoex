import { useValue } from "@legendapp/state/react";
import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Dialog } from "@/components/ui/dialog";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { greeting } from "@/features/settings/utils/greeting";
import { session$ } from "@/state/session";

export interface AccountSectionProps {
  /** Makes the card a link (the index's header) instead of holding Sign out. */
  onPress?: () => void;
}

export function AccountSection({ onPress }: AccountSectionProps) {
  const user = useValue(session$.user);
  const { start, dialog } = useSignOut();

  return (
    <Frame>
      <Frame.Panel data-attached="column">
        <Frame.Row chevron={!!onPress} onClick={onPress}>
          <Frame.Media>
            <Avatar src={user?.avatarUrl ?? undefined} name={user?.name} />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{greeting(user?.name)}</Frame.Title>
            <Frame.Description>Signed in with AniList</Frame.Description>
          </Frame.Content>
          {!onPress && (
            <Frame.Actions>
              <Button variant="ghost" onClick={start}>
                Sign out
              </Button>
              <Dialog {...dialog} />
            </Frame.Actions>
          )}
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
