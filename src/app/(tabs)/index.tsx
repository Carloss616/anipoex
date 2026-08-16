import { useValue } from "@legendapp/state/react";
import { Redirect } from "expo-router";
import { Home } from "@/features/home/screens/home";
import { session$ } from "@/state/session";

export default function HomeScreen() {
  const token = useValue(session$.token);

  if (!token) return <Redirect href="/sign-in" />;

  return <Home />;
}
