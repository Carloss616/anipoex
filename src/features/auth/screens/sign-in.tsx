import { router } from "expo-router";
import { useState } from "react";
import { Center } from "@/components/layout/center";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { setToken, setUser } from "@/state/session";
import { anilist } from "../trackers/anilist";

function close() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export function SignIn() {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setIsBusy(true);
    setError(null);
    try {
      const result = await anilist.authorize();
      if (!result) return;
      await setToken(result.accessToken);

      try {
        const user = await anilist.fetchViewer();
        setUser(user);
      } catch (cause) {
        // TODO: implement toast
        console.warn(
          "[sign-in] fetchViewer failed after token was persisted",
          cause instanceof Error ? cause.message : cause,
        );
      }

      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Host className="flex-1">
      <Center className="gap-4 px-8 py-24">
        <Typography type="h5" align="center">
          Connect your account
        </Typography>
        <Typography type="body-xs" align="center" color="muted">
          Sync your reading progress with AniList.
        </Typography>
        <Button onPress={handleSignIn} isDisabled={isBusy}>
          {isBusy ? "Connecting..." : "Sign in with AniList"}
        </Button>
        <Button variant="ghost" onPress={close} isDisabled={isBusy}>
          Not now
        </Button>
        {error && (
          <Typography type="body-xs" align="center" className="text-danger">
            {error}
          </Typography>
        )}
      </Center>
    </Host>
  );
}
