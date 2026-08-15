import Lucide from "@react-native-vector-icons/lucide";
import { usePathname } from "expo-router";
import {
  TabList,
  type TabListProps,
  TabSlot as TabSlotBase,
  Tabs as TabsBase,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Tabs as HeroTabs } from "heroui-native/tabs";
import { Surface } from "panelui-native/components/surface";
import { cn } from "panelui-native/utils/cn";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";
import { noop } from "@/utils/utils";
import { ThemeToggle } from "../../theme-toggle";

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
    <HeroTabs value={value} onValueChange={noop} className="flex-1">
      <TabsBase>
        <TabSlot className="flex-1" />
        <TabList asChild>
          <HeroTabList>
            {ROUTES.map((item) => (
              <TabTrigger
                key={item.name}
                name={item.name}
                href={item.href}
                asChild
              >
                <TabButton item={item}>{item.label}</TabButton>
              </TabTrigger>
            ))}
          </HeroTabList>
        </TabList>
      </TabsBase>
    </HeroTabs>
  );
}

function TabButton({
  item,
  isFocused,
  children,
  ...props
}: TabTriggerSlotProps & { item: Route }) {
  const [primary, mutedForeground] = useThemeColor([
    "primary",
    "muted-foreground",
  ]);

  return (
    <HeroTabs.Trigger value={item.href} {...props}>
      {({ isSelected }) => (
        <>
          <Lucide
            size={18}
            name={isSelected ? item.icon.selected : item.icon.default}
            color={isSelected ? primary : mutedForeground}
          />
          <HeroTabs.Label
            className={isSelected ? "text-primary" : "text-muted-foreground"}
          >
            {children}
          </HeroTabs.Label>
        </>
      )}
    </HeroTabs.Trigger>
  );
}

function HeroTabList({ children, className, ...props }: TabListProps) {
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
        className="flex-row items-center gap-2 rounded-full p-2"
      >
        {/* TabTriggers must stay direct children of TabList, so the list lives here. */}
        <HeroTabs.List>
          <HeroTabs.ScrollView scrollAlign="center">
            <HeroTabs.Indicator />
            {children}
          </HeroTabs.ScrollView>
        </HeroTabs.List>

        <ThemeToggle />
      </Surface>
    </View>
  );
}
