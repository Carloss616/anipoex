import { Icons } from "@/components/ui/icon";

export const COPY = {
  offline: {
    icon: Icons.offline,
    title: "You're offline",
    description:
      "These changes are kept on this device and go out when you're back online.",
  },
  sending: {
    icon: Icons.uploading,
    title: "Back online",
    description: "Sending…",
  },
} as const;
