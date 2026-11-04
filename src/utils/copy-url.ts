import * as Clipboard from "expo-clipboard";
import { Platform, Share } from "react-native";
import { toast } from "@/components/ui/toast";

// Android 13+ shows its own "Copied" notice for every copy.
const SYSTEM_CONFIRMS_COPY =
  Platform.OS === "android" && Number(Platform.Version) >= 33;

/** Copies a URL and says so, unless the system already does. */
export const copyUrl = (url: string) =>
  void Clipboard.setStringAsync(url).then(
    () => {
      if (!SYSTEM_CONFIRMS_COPY) toast.success("URL copied");
    },
    () => toast.error("Couldn't copy the URL"),
  );

/** The share sheet, or a copy where there is none (desktop browsers). */
export const shareUrl = (url: string) =>
  void Share.share(
    // Android shares the message; iOS and the web take the url.
    Platform.OS === "android" ? { message: url } : { url },
  ).catch((error: unknown) => {
    // A dismissed sheet rejects too (AbortError).
    const dismissed = error instanceof Error && error.name === "AbortError";
    if (Platform.OS === "web" && !dismissed) copyUrl(url);
  });
