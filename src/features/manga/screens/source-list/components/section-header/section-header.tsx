import { Computed } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu, type MenuItem } from "@/components/ui/menu";

export interface SectionHeaderProps {
  title: string;
  count: number;
  /** Read in a `Computed`, so the items follow the observables they read. */
  menu?: () => MenuItem[];
}

export const SectionHeader = memo(function SectionHeader({
  title,
  count,
  menu,
}: SectionHeaderProps) {
  return (
    <Frame.Header className="stuck:glass-chrome stuck:inset-shadow-none stuck:border-b">
      <Frame.Title>
        {title} <Badge>{count}</Badge>
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
                  <Icon name={Icons.more} size={BUTTON_ICON_SIZE} />
                </Button>
              </Menu>
            )}
          </Computed>
        </Frame.Action>
      )}
    </Frame.Header>
  );
});
