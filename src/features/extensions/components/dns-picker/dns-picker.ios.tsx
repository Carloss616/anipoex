import { Text } from "@/components/native/swift-ui/text";
import { Menu } from "@/components/ui/menu";
import { useDns } from "./hooks/use-dns";

/** Picks the resolver extensions use. */
export function DnsPicker() {
  const { label, items } = useDns();

  return (
    <Menu items={items}>
      <Text>{label}</Text>
    </Menu>
  );
}
