import { Spacer } from "@expo/ui";
import { Platform, View } from "react-native";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { RNHostView } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { noop } from "@/utils/utils";
import { WEB_ICON_COLOR } from "../constants";

export function Tracking() {
  return (
    <Button
      variant={Platform.select({
        android: "outline",
        default: "tertiary",
      })}
      onPress={noop}
      className="h-auto web:w-full web:rounded-full py-4"
    >
      <Column className="web:w-full gap-2">
        <Row alignment="center" className="gap-2">
          <RNHostView matchContents>
            <View className="size-2 rounded-full bg-accent" />
          </RNHostView>
          <Button.Label className="ios:text-foreground">Reading</Button.Label>
          <Spacer flexible />
          <Typography.Code className="web:self-auto">42/120</Typography.Code>
          <Typography type="body-xs" color="muted">
            35%
          </Typography>
          <Icon
            name={Icon.select({
              ios: "chevron.right",
              android: require("@expo/material-symbols/chevron_right.xml"),
              web: "chevron-right",
            })}
            size={18}
            colorClassName={WEB_ICON_COLOR}
          />
        </Row>
        <Progress value={0.35} />
      </Column>
    </Button>
  );
}
