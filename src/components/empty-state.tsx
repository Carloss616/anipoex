import { cn } from "heroui-native/utils";
import { useState } from "react";
import { Platform } from "react-native";
import { EnsureHost } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { Column } from "./layout/column";
import { Row } from "./layout/row";

/** @see https://github.com/mihonapp/mihon/blob/main/presentation-core/src/main/java/tachiyomi/presentation/core/screens/EmptyScreen.kt */
const FACES = [
  "(･o･;)",
  "Σ(ಠ_ಠ)",
  "ಥ_ಥ",
  "(˘･_･˘)",
  "(；￣Д￣)",
  "(･Д･。",
  "(╬ಠ益ಠ)",
  "(╥﹏╥)",
  "(⋟﹏⋞)",
  "Ò︵Ó",
  " ˙ᯅ˙)",
  "(¬_¬)",
];

type EmptyStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  const [face] = useState(
    () => FACES[Math.floor(Math.random() * FACES.length)],
  );
  const column = (
    <Column
      alignment="center"
      className={cn(
        "web:flex-1 web:justify-center gap-3 px-8 py-24",
        className,
      )}
    >
      <Typography align="center" color="muted" className="text-5xl">
        {face}
      </Typography>
      <Typography type="h5" align="center" color="muted">
        {title}
      </Typography>
      {description && (
        <Typography type="body-xs" align="center" color="muted">
          {description}
        </Typography>
      )}
      {children}
    </Column>
  );

  return (
    <EnsureHost className="flex-1">
      {Platform.OS === "android" ? (
        <Row alignment="center">{column}</Row>
      ) : (
        column
      )}
    </EnsureHost>
  );
}
