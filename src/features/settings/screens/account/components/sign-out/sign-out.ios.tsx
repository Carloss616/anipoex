import { Button, Section } from "@expo/ui/swift-ui";
import { useFont } from "@/components/native/swift-ui/text";
import { Dialog } from "@/components/ui/dialog";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";

export function SignOut() {
  const buttonFont = useFont("body");
  const rowBackground = useRowBackground();
  const { start, dialog } = useSignOut();

  return (
    <Section modifiers={[rowBackground]}>
      <Button
        label="Sign out"
        role="destructive"
        onPress={start}
        modifiers={[buttonFont]}
      />
      <Dialog {...dialog} alert />
    </Section>
  );
}
