import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { useHeaderScroll } from "@/hooks/use-header-scroll";

export interface SettingsPageProps {
  title: string;
  /** The page's sections. */
  children: ReactNode;
  /** Sheets and dialogs the sections open, outside the scroller. */
  overlays?: ReactNode;
  /** A large title, for the index. */
  large?: boolean;
}

/** A settings page: its sections as Frames in a narrow column. */
export function SettingsPage({
  title,
  children,
  overlays,
  large,
}: SettingsPageProps) {
  const headerScroll = useHeaderScroll();

  return (
    <>
      <Stack.Title large={large}>{title}</Stack.Title>
      <ScrollView className="flex-1" {...headerScroll}>
        {/* Beside the sidebar (lg) the column starts under the page title. */}
        <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-2xl gap-6 self-center pt-4 lg:self-start">
          {children}
        </HeaderInsetView>
      </ScrollView>
      {overlays}
    </>
  );
}
