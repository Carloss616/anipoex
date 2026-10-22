import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { isRuntimeAvailable } from "../../runtime";
import { useDns } from "./hooks/use-dns";

/** Picks the resolver extensions use; a plain browser runs none. */
export function DnsPicker() {
  const { label, items } = useDns();
  if (!isRuntimeAvailable) return null;

  return (
    <Menu items={items}>
      <Button variant="outline">{label}</Button>
    </Menu>
  );
}
