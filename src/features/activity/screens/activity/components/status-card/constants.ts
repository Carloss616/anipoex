import { Icons } from "@/components/ui/icon";

export const COPY = {
  offline: {
    icon: Icons.offline,
    title: "You're offline",
    description: "Scans, downloads and changes wait until you're back online.",
  },
  sending: {
    icon: Icons.uploading,
    title: "Back online",
  },
  paused: {
    icon: Icons.pause,
    title: "Downloads paused",
    description: "Paused by you",
  },
} as const;
