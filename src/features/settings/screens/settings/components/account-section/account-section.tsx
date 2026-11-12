import { useValue } from "@legendapp/state/react";
import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { signOut } from "@/features/auth/utils/sign-out";
import { session$ } from "@/state/session";
import { greeting } from "../../utils";

export function AccountSection() {
  const user = useValue(session$.user);

  return (
    <Frame className="mt-4">
      <Frame.Header>
        <Frame.Title>Account</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <Frame.Row>
          <Frame.Media>
            <Avatar src={user?.avatarUrl ?? undefined} name={user?.name} />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{greeting(user?.name)}</Frame.Title>
            <Frame.Description>Signed in with AniList</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </Frame.Actions>
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
