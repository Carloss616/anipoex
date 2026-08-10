import { useValue } from "@legendapp/state/react";
import { Link } from "expo-router";
import { Center } from "@/components/layout/center";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { toast } from "@/components/ui/toast";
import { Typography } from "@/components/ui/typography";
import { clearSession, session$ } from "@/state/session";

export function Home() {
  const token = useValue(session$.token);
  const user = useValue(session$.user);

  async function handleSignOut() {
    try {
      await clearSession();
    } catch (cause) {
      toast.danger(
        cause instanceof Error ? cause.message : "Something went wrong",
      );
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
        <ThemeToggle />
      </Center>
    </Host>
  );
}
