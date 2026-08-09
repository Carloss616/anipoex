import { useValue } from "@legendapp/state/react";
import { Redirect } from "expo-router";
import { SignIn } from "@/features/auth/screens/sign-in";
import { session$ } from "@/state/session";

export default function SignInScreen() {
  const token = useValue(session$.token);

  if (token) return <Redirect href="/" />;

  return <SignIn />;
}
