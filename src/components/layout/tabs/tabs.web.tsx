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
import { Surface } from "panelui-native/components/surface";
import {
  Tabs as PanelTabs,
  type TabsVariant,
} from "panelui-native/components/tabs";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { ArrowKeyGroup } from "@/components/ui/arrow-key-group";
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
  const { isAtLeast } = useBreakpoint();
  const variant = isAtLeast("sm") ? "pill" : "expanding";

  return (
    <TabsBase>
      <TabSlot className="flex-1" />
      <TabList asChild>
        <PanelTabList
          className={cn(pathname.endsWith("/reader") && "hidden")}
          variant={variant}
        >
          {ROUTES.map((item) => (
            <TabTrigger
              key={item.name}
              name={item.name}
              href={item.href}
              asChild
            >
              <PanelTabTrigger item={item} variant={variant} />
            </TabTrigger>
          ))}
        </PanelTabList>
      </TabList>
    </TabsBase>
  );
}

function PanelTabTrigger({
  item,
  isFocused,
  disabled,
  variant,
  ...props
}: Omit<TabTriggerSlotProps, "children"> & {
  item: Route;
  variant?: TabsVariant;
}) {
  const isPill = variant === "pill";
  return (
    <PanelTabs.Trigger
      value={item.name}
      className={cn(
        "flex-none px-4 active:bg-accent",
        isPill ? "hover:bg-secondary/90" : "hover:bg-surface-tertiary/90",
      )}
      icon={
        <Icon
          size={BUTTON_ICON_SIZE}
          name={isFocused ? item.icon.selected : item.icon.default}
          className={cn(
            isFocused
              ? isPill
                ? "text-primary-foreground"
                : "text-foreground"
              : "text-muted-foreground",
          )}
        />
      }
      disabled={disabled ?? false}
      {...props}
    >
      {item.label}
    </PanelTabs.Trigger>
  );
}

function PanelTabList({
  children,
  className,
  variant,
  ...props
}: TabListProps & { variant?: TabsVariant }) {
  const { switchTab, getTrigger } = useTabTrigger({ name: ROUTES[0].name });
  const value = ROUTES.find(({ name }) => getTrigger(name)?.isFocused)?.name;

  // PanelTabs.Trigger drops TabTrigger's onPress. Switch tabs as it would:
  // router.navigate pushes the tab's index onto its stack again.
  const select = (name: string) => {
    const trigger = getTrigger(name);
    if (!trigger?.isFocused) switchTab(name, {});
    else if (trigger.route?.state?.index)
      router.dismissTo(trigger.resolvedHref as (typeof ROUTES)[number]["href"]);
  };

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
        variant="secondary"
        className="flex-row items-center gap-2 rounded-full"
        padding="sm"
        bordered
        elevated
      >
        <PanelTabs
          value={value}
          defaultValue={ROUTES[0].name}
          onValueChange={select}
          variant={variant}
        >
          <ArrowKeyGroup orientation="horizontal">
            <PanelTabs.List>{children}</PanelTabs.List>
          </ArrowKeyGroup>
        </PanelTabs>
        <ThemeToggle />
      </Surface>
    </View>
  );
}
