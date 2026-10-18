import { Column, OutlinedButton, TextButton } from "@expo/ui/jetpack-compose";
import { fillMaxSize, padding } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useSignIn } from "./hooks/use-sign-in";

const LABEL = { typography: "labelLarge" } as const;

export function SignIn() {
  const { isBusy, signIn, close } = useSignIn();
  const m3 = useThemeM3Colors();

  return (
    <Host className="flex-1">
      <Column
        verticalArrangement="center"
        horizontalAlignment="center"
        modifiers={[fillMaxSize(), padding(32, 96, 32, 96)]}
      >
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          horizontalAlignment="center"
        >
          <Text
            style={{
              typography: "titleMedium",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Connect your account
          </Text>
          <Text
            style={{ typography: "bodySmall", textAlign: "center" }}
            color={m3.onSurfaceVariant}
          >
            Sync your reading progress with AniList.
          </Text>
          <OutlinedButton enabled={!isBusy} onClick={signIn}>
            <Text style={LABEL}>
              {isBusy ? "Connecting..." : "Sign in with AniList"}
            </Text>
          </OutlinedButton>
          <TextButton enabled={!isBusy} onClick={close}>
            <Text style={LABEL}>Not now</Text>
          </TextButton>
        </Column>
      </Column>
    </Host>
  );
}
