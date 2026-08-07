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

const IconRoot = withUniwind(IconRootBase);

export interface IconSelectSpec extends IconBaseSelectSpec {
  web?: LucideName;
}

const select = <T extends IconSelectSpec = IconSelectSpec>(spec: T) => {
  return spec.web as {
    // `require()` returns `any`, which distributes to both branches and
    // collapses the whole union to `any`; `0 extends 1 & V` catches it first.
    [K in keyof T]: 0 extends 1 & T[K]
      ? ImageSourcePropType
      : T[K] extends Promise<unknown>
        ? ImageSourcePropType
        : T[K];
  }[keyof T];
};

export const Icon = Object.assign(IconRoot, {
  select,
});
