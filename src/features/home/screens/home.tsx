import { useValue } from "@legendapp/state/react";
import { Center } from "@/components/layout/center";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { toast } from "@/components/ui/toast";
import { Typography } from "@/components/ui/typography";
import { clearCache } from "@/graphql/client";
import { clearSession, session$ } from "@/state/session";

export function Home() {
  const user = useValue(session$.user);

  async function handleSignOut() {
    const results = await Promise.allSettled([clearSession(), clearCache()]);
    const failed = results.find((r) => r.status === "rejected");

    if (failed) {
      toast.destructive(
        failed.reason instanceof Error
          ? failed.reason.message
          : "Something went wrong",
      );
    }
  }

  return (
    <Host className="flex-1">
      <Center className="gap-4 px-8 py-24">
        <Typography type="h5" align="center">
          {user ? `Hi, ${user.name}` : "Signed in"}
        </Typography>
        <Button variant="outline" onPress={handleSignOut}>
          Sign out
        </Button>
        <ThemeToggle />
        <ThemePicker />
      </Center>
    </Host>
  );
}
