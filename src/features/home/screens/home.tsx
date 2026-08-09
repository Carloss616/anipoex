import { useValue } from "@legendapp/state/react";
import { Link } from "expo-router";
import { useState } from "react";
import { Center } from "@/components/layout/center";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { clearSession, session$ } from "@/state/session";

export function Home() {
  const token = useValue(session$.token);
  const user = useValue(session$.user);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    try {
      await clearSession();
    } catch (cause) {
      // TODO: implement toast
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    }
  }

  return (
    <Host className="flex-1">
      <Center className="gap-4 px-8 py-24">
        <Typography type="h5" align="center">
          {token ? (user ? `Hi, ${user.name}` : "Signed in") : "Anipoex"}
        </Typography>
        {token ? (
          <Button variant="outline" onPress={handleSignOut}>
            Sign out
          </Button>
        ) : (
          <Link href="/sign-in" asChild>
            <Button>Sign in with AniList</Button>
          </Link>
        )}
        {error && (
          <Typography type="body-xs" align="center" className="text-danger">
            {error}
          </Typography>
        )}
        <ThemeToggle />
      </Center>
    </Host>
  );
}
