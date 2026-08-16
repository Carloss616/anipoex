import Lucide from "@react-native-vector-icons/lucide";
import { router, usePathname } from "expo-router";
import {
  TabList,
  type TabListProps,
  TabSlot as TabSlotBase,
  Tabs as TabsBase,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Surface } from "panelui-native/components/surface";
import { Tabs as PanelTabs } from "panelui-native/components/tabs";
import { cn } from "panelui-native/utils/cn";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { ThemeToggle } from "@/components/theme-toggle";
import { useThemeColor } from "@/hooks/use-theme-color";

const TabSlot = withUniwind(TabSlotBase);

type LucideIconProps = ComponentProps<typeof Lucide>["name"];
type Route = {
  name: string;
  href: string;
  label: string;
  icon: {
    default: LucideIconProps;
    selected: LucideIconProps;
  };
};

const ROUTES = [
  {
    name: "home",
    href: "/",
    label: "Home",
    icon: { default: "house", selected: "house-heart" },
  },
  {
    name: "manga",
    href: "/manga",
    label: "Manga",
    icon: { default: "book-open", selected: "book-open-text" },
  },
] as const satisfies Route[];

export function Tabs() {
  const pathname = usePathname();
  const value =
    ROUTES.find(({ href }) => href !== "/" && pathname.startsWith(href))
      ?.href ?? "/";

  return (
    <PanelTabs
      value={value}
      defaultValue="/"
      onValueChange={(href) =>
        router.navigate(href as (typeof ROUTES)[number]["href"])
      }
      variant="pill"
      className="flex-1"
    >
      <TabsBase>
        <TabSlot className="flex-1" />
        <TabList asChild>
          <PanelTabList>
            {ROUTES.map((item) => (
              <TabTrigger
                key={item.name}
                name={item.name}
                href={item.href}
                asChild
              >
                <PanelTabTrigger item={item} />
              </TabTrigger>
            ))}
          </PanelTabList>
        </TabList>
      </TabsBase>
    </PanelTabs>
  );
}

function PanelTabTrigger({
  item,
  isFocused,
  disabled,
  ...props
}: Omit<TabTriggerSlotProps, "children"> & { item: Route }) {
  const [primaryForeground, mutedForeground] = useThemeColor([
    "primary-foreground",
    "muted-foreground",
  ]);

  return (
    <PanelTabs.Trigger
      value={item.href}
      className="px-4"
      icon={
        <Lucide
          size={18}
          name={isFocused ? item.icon.selected : item.icon.default}
          color={isFocused ? primaryForeground : mutedForeground}
        />
      }
      disabled={disabled ?? false}
      {...props}
    >
      {item.label}
    </PanelTabs.Trigger>
  );
}

function PanelTabList({ children, className, ...props }: TabListProps) {
  return (
    <View
      pointerEvents="box-none"
      className={cn(
        className,
        "justify-center! absolute bottom-0 w-full items-center p-4",
      )}
      {...props}
    >
      <Surface
        variant="tertiary"
        className="flex-row items-center gap-2 rounded-full"
        padding="sm"
        bordered
      >
        <PanelTabs.List>{children}</PanelTabs.List>
        <ThemeToggle />
      </Surface>
    </View>
  );
}
