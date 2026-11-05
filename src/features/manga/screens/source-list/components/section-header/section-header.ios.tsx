import { HStack, Spacer } from "@expo/ui/swift-ui";
import { Computed } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Menu } from "@/components/ui/menu";
import type { SectionHeaderProps } from "./section-header";

export function SectionHeader({ title, count, menu }: SectionHeaderProps) {
  return (
    <HStack spacing={12}>
      <Text textStyle="footnote" weight="medium">
        {title}
      </Text>
      <Badge>{count}</Badge>
      {menu && (
        <>
          <Spacer />
          {/* A section header's action is text, as Update all on the
              extension list. */}
          <Computed>
            {() => (
              <Menu items={menu()}>
                <Text textStyle="subheadline" weight="medium">
                  Manage
                </Text>
              </Menu>
            )}
          </Computed>
        </>
      )}
    </HStack>
  );
}
