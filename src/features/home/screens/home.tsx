import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { EnsureHost } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { SignIn } from "@/features/auth/screens/sign-in";
import { clearSession, session$ } from "@/state/session";

export function Home() {
  const token = useValue(session$.token);
  const user = useValue(session$.user);
  const [error, setError] = useState<string | null>(null);

  // The token is the proof of session. A cached user without one is stale.
  if (!token) return <SignIn />;

  async function handleSignOut() {
    setError(null);
    try {
      // clearSession throws when deleting the stored token fails, so
      // the sign-out truly did not happen — that must reach the user
      // instead of vanishing as a floating-promise rejection.
      await clearSession();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    }
  }

  return (
    <EnsureHost className="flex-1">
      <Column alignment="center" className="gap-4 px-8 py-24">
        <Typography type="h5" align="center">
          {user ? `Hi, ${user.name}` : "Signed in"}
        </Typography>
        <Button variant="outline" onPress={handleSignOut}>
          Sign out
        </Button>
        {error && (
          <Typography type="body-xs" align="center" className="text-danger">
            {error}
          </Typography>
        )}
        <ThemeToggle />
      </Column>
    </EnsureHost>
  );
}
