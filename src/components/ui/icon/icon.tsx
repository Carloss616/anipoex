import type {
  Icon as IconBase,
  IconName as IconBaseName,
  IconProps as IconBaseProps,
  IconSelectSpec as IconBaseSelectSpec,
} from "@expo/ui";
import { Lucide } from "@react-native-vector-icons/lucide";
import type { SFSymbol } from "expo-symbols";
import type { ImageSourcePropType } from "react-native";
import { withUniwind } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";

type LucideName = React.ComponentProps<typeof Lucide>["name"];

export type IconName =
  | IconBaseName
  | LucideName
  | {
      ios: SFSymbol;
      android: ImageSourcePropType;
      web: LucideName;
    };

export interface IconExtendProps {
  muted?: boolean;
}

export interface IconProps
  extends Omit<IconBaseProps, "name">,
    IconExtendProps {
  name: IconName;
}

function IconRootBase({ name, muted, color, ...props }: IconProps) {
  const [foreground, mutedForeground] = useThemeColor([
    "foreground",
    "muted-foreground",
  ]);

  return (
    <Lucide
      name={
        typeof name === "object" && "web" in name
          ? name.web
          : (name as LucideName)
      }
      color={muted ? mutedForeground : (color ?? foreground)}
      {...props}
    />
  );
}

const IconRoot = withUniwind(IconRootBase, {
  style: {
    fromClassName: "className",
  },
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
});

export interface IconSelectSpec extends IconBaseSelectSpec {
  web?: LucideName;
}

/**
 * Picks `spec.web` at runtime, but types the result like the native
 * `Icon.select` so it stays assignable to native-typed props such as
 * `Stack.Toolbar.Button`'s `icon`. `web-toolbar.web.tsx` casts it back to
 * a Lucide name when it actually renders the icon on web.
 */
const select = (spec: IconSelectSpec) =>
  spec.web as unknown as ReturnType<typeof IconBase.select>;

export const Icon = Object.assign(IconRoot, {
  select,
});
