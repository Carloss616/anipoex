import { Spacer } from "@expo/ui";
import { Fragment } from "react";
import { ExternalLink } from "@/components/external-link";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { WEB_ICON_COLOR } from "../constants";

const ACTIONS = [
  {
    icon: Icon.select({
      ios: "book",
      android: require("@expo/material-symbols/book_2.xml"),
      web: "book-open",
    }),
    label: "Source",
    mode: "action",
  },
  {
    icon: Icon.select({
      ios: "hourglass",
      android: require("@expo/material-symbols/hourglass.xml"),
      web: "hourglass",
    }),
    label: "4 days",
    mode: "action",
  },
  {
    icon: Icon.select({
      ios: "globe",
      android: require("@expo/material-symbols/public.xml"),
      web: "globe",
    }),
    label: "Website",
    mode: "anilist-link",
  },
] as const;

const ButtonOrLink = ({
  id,
  mode,
  children,
}: {
  id: number | string;
  mode: (typeof ACTIONS)[number]["mode"];
  children: React.ReactNode;
}) => {
  if (mode === "anilist-link") {
    return (
      <ExternalLink href={`https://anilist.co/manga/${id}`}>
        <Button variant="ghost" className="h-auto">
          {children}
        </Button>
      </ExternalLink>
    );
  }
  return (
    <Button variant="ghost" className="h-auto">
      {children}
    </Button>
  );
};

export function Actions({ id }: { id: number | string }) {
  return (
    <Row alignment="center">
      {ACTIONS.map(({ icon, label, mode }, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <>
              <Spacer flexible />
              <Separator orientation="vertical" className="h-8" />
              <Spacer flexible />
            </>
          )}
          <ButtonOrLink id={id} mode={mode}>
            <Column className="web:self-auto! gap-0.5" alignment="center">
              <Icon name={icon} size={18} colorClassName={WEB_ICON_COLOR} />
              <Typography type="body-sm" className="ios:text-foreground">
                {label}
              </Typography>
            </Column>
          </ButtonOrLink>
        </Fragment>
      ))}
    </Row>
  );
}
