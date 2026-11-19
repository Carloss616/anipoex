import { Redirect } from "expo-router";

export default function PendingScreen() {
  return <Redirect href="/settings/activity?filter=send" />;
}
