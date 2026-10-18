import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useSignIn } from "./hooks/use-sign-in";

export function SignIn() {
  const { isBusy, signIn, close } = useSignIn();

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 py-24">
      <Typography type="h5" align="center">
        Connect your account
      </Typography>
      <Typography type="body-xs" align="center" muted>
        Sync your reading progress with AniList.
      </Typography>
      <Button variant="social" onPress={signIn} disabled={isBusy}>
        {isBusy ? "Connecting..." : "Sign in with AniList"}
      </Button>
      <Button variant="ghost" onPress={close} disabled={isBusy}>
        Not now
      </Button>
    </View>
  );
}
