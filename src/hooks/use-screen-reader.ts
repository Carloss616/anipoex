import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Whether VoiceOver or TalkBack is on, for content that moves by itself. */
export function useScreenReader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isScreenReaderEnabled().then(setEnabled);
    const sub = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setEnabled,
    );
    return () => sub.remove();
  }, []);

  return enabled;
}
