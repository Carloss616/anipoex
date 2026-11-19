import { Stack } from "expo-router";
import { type ReactNode, useState } from "react";
import { ScrollView } from "react-native";
import { LARGE_TITLE_HEIGHT } from "@/components/layout/header/constants";
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
  const [viewport, setViewport] = useState(0);

  return (
    <>
      <Stack.Title large={large}>{title}</Stack.Title>
      <ScrollView
        className="flex-1"
        {...headerScroll}
        onLayout={(e) => setViewport(e.nativeEvent.layout.height)}
        // The header lifts only while the content still overflows collapsed:
        // a short page that scrolled would slide under a bare large title.
        contentContainerStyle={{ minHeight: viewport + LARGE_TITLE_HEIGHT + 1 }}
      >
        <HeaderInsetView className="gutters px-gx pb-gb w-full gap-6 pt-4">
          {children}
        </HeaderInsetView>
      </ScrollView>
      {overlays}
    </>
  );
}
