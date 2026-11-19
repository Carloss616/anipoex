import { Button, Section } from "@expo/ui/swift-ui";
import { useFont } from "@/components/native/swift-ui/text";
import { signOut } from "@/features/auth/utils/sign-out";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";

export function SignOut() {
  const buttonFont = useFont("body");
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]}>
      <Button
        label="Sign out"
        role="destructive"
        onPress={signOut}
        modifiers={[buttonFont]}
      />
    </Section>
  );
}
