import { Computed } from "@legendapp/state/react";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu, type MenuItem } from "@/components/ui/menu";

export interface SectionHeaderProps {
  title: string;
  count: number;
  /** Read in a `Computed`, so the items follow the observables they read. */
  menu?: () => MenuItem[];
  stuckVariant?: "default" | "destructive";
}

export const SectionHeader = memo(function SectionHeader({
  title,
  count,
  menu,
  stuckVariant = "default",
}: SectionHeaderProps) {
  const stuckDestructive = stuckVariant === "destructive";
  return (
    <Frame.Header
      className={cn(
        "transition-all",
        "stuck:glass-chrome stuck:rounded-full stuck:border stuck:shadow-lg stuck:mx-4",
        stuckDestructive && "stuck:glass-destructive stuck:border-destructive",
      )}
    >
      <Frame.Title
        className={cn(
          stuckDestructive && "stuck:text-destructive-solid-foreground",
        )}
      >
        {title}{" "}
        <Badge className={cn(stuckDestructive && "stuck:text-inherit")}>
          {count}
        </Badge>
      </Frame.Title>
      {menu && (
        <Frame.Action>
          <Computed>
            {() => (
              <Menu items={menu()}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${title} sources actions`}
                >
                  <Icon name={Icons.more} />
                </Button>
              </Menu>
            )}
          </Computed>
        </Frame.Action>
      )}
    </Frame.Header>
  );
});
