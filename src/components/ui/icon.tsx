import type {
  IconName as IconBaseName,
  IconProps as IconBaseProps,
  IconSelectSpec as IconBaseSelectSpec,
} from "@expo/ui";
import { Lucide } from "@react-native-vector-icons/lucide";
import type { SFSymbol } from "expo-symbols";
import type { ImageSourcePropType } from "react-native";
import { withUniwind } from "uniwind";

type LucideName = React.ComponentProps<typeof Lucide>["name"];

export type IconName =
  | IconBaseName
  | LucideName
  | {
      ios: SFSymbol;
      android: ImageSourcePropType;
      web: LucideName;
    };

export interface IconProps extends Omit<IconBaseProps, "name"> {
  name: IconName;
}

function IconRootBase({ name, ...props }: IconProps) {
  return (
    <Lucide
      name={
        typeof name === "object" && "web" in name
          ? name.web
          : (name as LucideName)
      }
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

const select = <T extends IconSelectSpec = IconSelectSpec>(spec: T) => {
  return spec.web as {
    [K in keyof T]: T[K] extends Promise<infer _> ? ImageSourcePropType : T[K];
  }[keyof T];
};

export const Icon = Object.assign(IconRoot, {
  select,
});
