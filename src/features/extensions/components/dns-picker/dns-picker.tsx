import { Button } from "panelui-web/button";
import { Menu } from "panelui-web/menu";
import { isRuntimeAvailable } from "../../runtime";
import { useDns } from "./hooks/use-dns";

/** Picks the resolver extensions use; a plain browser runs none. */
export function DnsPicker() {
  const { label, items } = useDns();
  if (!isRuntimeAvailable) return null;

  return (
    <Menu>
      <Menu.Trigger render={<Button variant="outline" />}>{label}</Menu.Trigger>
      <Menu.Content>
        <Menu.RadioGroup
          value={items.find((item) => item.checked)?.label ?? null}
          onValueChange={(value) =>
            items.find((item) => item.label === value)?.onPress?.()
          }
        >
          {items.map((item) => (
            <Menu.RadioItem key={item.label} value={item.label} closeOnClick>
              {item.label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
  );
}
