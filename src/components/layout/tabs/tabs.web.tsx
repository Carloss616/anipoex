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
import { cn } from "panelui-native/utils/cn";
import { Tabs as PanelTabs } from "panelui-web/tabs";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
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
] as const satisfies Route[];

export function Tabs() {
  const pathname = usePathname();

  return (
    <TabsBase>
      <TabSlot className="flex-1" />
      <TabList asChild>
        <PanelTabList className={cn(pathname.endsWith("/reader") && "hidden")}>
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

  // Base UI ignores clicks on the active tab: pop its stack, as TabTrigger does.
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
      {/* Below sm only the active label shows; 0fr→1fr animates its width. */}
      <span className="grid grid-cols-[0fr] in-data-active:grid-cols-[1fr] in-data-active:opacity-100 opacity-0 transition-[grid-template-columns,opacity] duration-300 ease-sheet motion-reduce:transition-none sm:grid-cols-[1fr] sm:opacity-100">
        <span className="min-w-0 overflow-hidden">
          <span className="ps-2">{item.label}</span>
        </span>
      </span>
    </PanelTabs.Trigger>
  );
}

function PanelTabList({ children, className, ...props }: TabListProps) {
  const { switchTab, getTrigger } = useTabTrigger({ name: ROUTES[0].name });
  const value = ROUTES.find(({ name }) => getTrigger(name)?.isFocused)?.name;

  return (
    <View
      pointerEvents="box-none"
      className={cn(
        className,
        "justify-center! absolute bottom-0 w-full items-center p-4",
      )}
      {...props}
    >
      <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface-secondary p-1.5 shadow-sm">
        <PanelTabs
          value={value ?? ROUTES[0].name}
          // router.navigate would push the tab's index again.
          onValueChange={(name) => switchTab(String(name), {})}
          variant="pills"
        >
          {/* Below sm the indicator lags a resizing tab: the trigger fills. */}
          <PanelTabs.List className="max-sm:*:data-[slot=tabs-indicator]:hidden">
            {children}
          </PanelTabs.List>
        </PanelTabs>
        <ThemeToggle />
      </View>
    </View>
  );
}
