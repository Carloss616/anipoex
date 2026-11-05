import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";

export function Home() {
  const router = useRouter();

  return (
    <>
      <Stack.Title large>Home</Stack.Title>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={Icons.person}
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
          />
        </Stack.Toolbar>
      </Toolbar>
      <View className="flex-1" />
    </>
  );
}
