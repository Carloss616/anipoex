import { Box, FilledTonalButton } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { Dialog } from "@/components/ui/dialog";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

export function SignOut() {
  const m3 = useThemeM3Colors();
  const { start, dialog } = useSignOut();

  return (
    <Box
      contentAlignment="center"
      modifiers={[fillMaxWidth(), padding(0, 24, 0, 0)]}
    >
      <FilledTonalButton
        onClick={start}
        colors={{
          containerColor: m3.errorContainer,
          contentColor: m3.onErrorContainer,
        }}
      >
        <Text style={{ typography: "labelLarge" }}>Sign out</Text>
      </FilledTonalButton>
      <Dialog {...dialog} />
    </Box>
  );
}
