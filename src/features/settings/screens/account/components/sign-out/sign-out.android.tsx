import { Box, FilledTonalButton } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { signOut } from "@/features/auth/utils/sign-out";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

export function SignOut() {
  const m3 = useThemeM3Colors();

  return (
    <Box
      contentAlignment="center"
      modifiers={[fillMaxWidth(), padding(0, 24, 0, 0)]}
    >
      <FilledTonalButton
        onClick={signOut}
        colors={{
          containerColor: m3.errorContainer,
          contentColor: m3.onErrorContainer,
        }}
      >
        <Text>Sign out</Text>
      </FilledTonalButton>
    </Box>
  );
}
