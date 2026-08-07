import { Spacer } from "@expo/ui";
import { Fragment } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { WEB_ICON_COLOR } from "../constants";

const ACTIONS = [
  {
    icon: Icon.select({
      ios: "book",
      android: require("@expo/material-symbols/book_2.xml"),
      web: "book-open",
    }),
    label: "Source",
  },
  {
    icon: Icon.select({
      ios: "hourglass",
      android: require("@expo/material-symbols/hourglass.xml"),
      web: "hourglass",
    }),
    label: "4 days",
  },
  {
    icon: Icon.select({
      ios: "globe",
      android: require("@expo/material-symbols/public.xml"),
      web: "globe",
    }),
    label: "Website",
  },
];

export function Actions() {
  return (
    <Row alignment="center">
      {ACTIONS.map(({ icon, label }, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <>
              <Spacer flexible />
              <Separator orientation="vertical" className="h-8" />
              <Spacer flexible />
            </>
          )}
          <Button variant="ghost" className="h-auto">
            <Column className="web:self-auto! gap-0.5" alignment="center">
              <Icon name={icon} size={18} colorClassName={WEB_ICON_COLOR} />
              <Button.Label className="ios:text-foreground">
                {label}
              </Button.Label>
            </Column>
          </Button>
        </Fragment>
      ))}
    </Row>
  );
}
