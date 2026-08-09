import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";

// Fallback for Stack.Protected, which can only redirect within its own
// navigator. Leaves the tab first so cancelling lands on home instead of back
// here, where focus would re-fire the redirect.
export default function MangaSignInScreen() {
  useFocusEffect(
    useCallback(() => {
      router.replace("/");
      router.push("/sign-in");
    }, []),
  );

  return null;
}
