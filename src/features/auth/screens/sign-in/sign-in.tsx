import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { View } from "react-native";
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
      <Button onClick={signIn} disabled={isBusy}>
        {isBusy ? "Connecting..." : "Sign in with AniList"}
      </Button>
      <Button variant="ghost" onClick={close} disabled={isBusy}>
        Not now
      </Button>
    </View>
  );
}
