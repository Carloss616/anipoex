import { Center } from "@/components/layout/center";
import { ScrollView } from "@/components/layout/scroll-view";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { useSignOut } from "./hooks/use-sign-out";

export function Home() {
  const { greeting, signOut } = useSignOut();

  return (
    <Host className="flex-1">
      <ScrollView>
        <Center className="gap-4 px-8 py-24">
          <Typography type="h5" align="center">
            {greeting}
          </Typography>
          <Button variant="outline" onPress={signOut}>
            Sign out
          </Button>
          <ThemeToggle />
          <ThemePicker />
        </Center>
      </ScrollView>
    </Host>
  );
}
