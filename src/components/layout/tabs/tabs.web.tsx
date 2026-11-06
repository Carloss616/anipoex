import type Lucide from "@react-native-vector-icons/lucide";
import { router, usePathname } from "expo-router";
import {
  TabList,
  type TabListProps,
  TabSlot as TabSlotBase,
  Tabs as TabsBase,
  TabTrigger,
  type TabTriggerSlotProps,
  useTabTrigger,
} from "expo-router/ui";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Tabs as PanelTabs } from "panelui-web/tabs";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { BUTTON_ICON_SIZE, Icon } from "@/components/ui/icon";

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
  {
    name: "extensions",
    href: "/extensions",
    label: "Extensions",
    icon: { default: "puzzle", selected: "puzzle" },
  },
  {
    name: "settings",
    href: "/settings",
    label: "Settings",
    icon: { default: "settings", selected: "settings-2" },
  },
] as const satisfies Route[];

export function Tabs() {
  const pathname = usePathname();

  return (
    <TabsBase className="relative">
      <TabSlot className="flex-1" />
      <TabList asChild>
        <PanelTabList
          className={cn(
            !["/", "/manga", "/search"].includes(pathname) && "glass-muted",
            pathname.endsWith("/reader") && "hidden",
          )}
        >
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
  );
}

// TabTrigger's RN press props don't fit a DOM button; the list switches tabs.
function PanelTabTrigger({
  item,
  isFocused,
  disabled,
}: Omit<TabTriggerSlotProps, "children"> & { item: Route }) {
  const { trigger } = useTabTrigger({ name: item.name });

  // Base UI ignores clicks on the active tab: pop its stack like TabTrigger.
  const popToRoot = () => {
    if (isFocused && trigger?.route?.state?.index)
      router.dismissTo(trigger.resolvedHref as (typeof ROUTES)[number]["href"]);
  };

  return (
    <PanelTabs.Trigger
      value={item.name}
      onClick={popToRoot}
      className="gap-0 transition-[color,background-color] duration-300 ease-sheet max-sm:data-active:bg-primary max-sm:data-active:hover:bg-primary"
      disabled={disabled ?? false}
    >
      <Icon
        size={BUTTON_ICON_SIZE}
        name={isFocused ? item.icon.selected : item.icon.default}
      />
      {/* Below sm only the active label shows; 0fr→1fr animates width. */}
      <View className="grid grid-cols-[0fr] in-data-active:grid-cols-[1fr] in-data-active:opacity-100 opacity-0 transition-[grid-template-columns,opacity] duration-300 ease-sheet motion-reduce:transition-none sm:grid-cols-[1fr] sm:opacity-100">
        <View className="overflow-hidden">
          <Typography
            type="body-sm"
            weight="medium"
            className="ps-2 text-inherit"
            numberOfLines={1}
          >
            {item.label}
          </Typography>
        </View>
      </View>
    </PanelTabs.Trigger>
  );
}

function PanelTabList({ children, className, ...props }: TabListProps) {
  const { switchTab, getTrigger } = useTabTrigger({ name: ROUTES[0].name });
  const value = ROUTES.find(({ name }) => getTrigger(name)?.isFocused)?.name;

  return (
    <View
      className={cn(
        className,
        "glass-chrome absolute bottom-4 left-1/2 -translate-x-1/2 flex-row items-center gap-2 rounded-full border p-1.5 shadow-lg",
      )}
      {...props}
    >
      <PanelTabs
        value={value ?? ROUTES[0].name}
        onValueChange={(name) => switchTab(String(name), {})}
        variant="pills"
      >
        <PanelTabs.List className="max-sm:*:data-[slot=tabs-indicator]:hidden">
          {children}
        </PanelTabs.List>
      </PanelTabs>
    </View>
  );
}
