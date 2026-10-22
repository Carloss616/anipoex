import { OutlinedButton } from "@expo/ui/jetpack-compose";
import { Text } from "@/components/native/jetpack-compose/text";
import { Menu } from "@/components/ui/menu";
import { useDns } from "./hooks/use-dns";

/** Picks the resolver extensions use. */
export function DnsPicker() {
  const { label, items } = useDns();

  return (
    <Menu items={items}>
      <DnsButton label={label} />
    </Menu>
  );
}

// The menu hands its opener in as `onPress`.
function DnsButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <OutlinedButton onClick={onPress}>
      <Text style={{ typography: "labelLarge" }}>{label}</Text>
    </OutlinedButton>
  );
}
