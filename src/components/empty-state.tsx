import type { UniversalHostProps } from "@expo/ui";
import { cn } from "heroui-native/utils";
import { useState } from "react";
import { Platform } from "react-native";
import { Host, useIsInsideHost } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import { Column } from "./layout/column";
import { Row } from "./layout/row";

// https://github.com/mihonapp/mihon/blob/main/presentation-core/src/main/java/tachiyomi/presentation/core/screens/EmptyScreen.kt
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
  host?: UniversalHostProps;
};

export function EmptyState({
  title,
  description,
  children,
  className,
  host,
}: EmptyStateProps) {
  const [face] = useState(
    () => FACES[Math.floor(Math.random() * FACES.length)],
  );
  const isInsideHost = useIsInsideHost();

  const column = (
    <Column alignment="center" className={cn("gap-3 px-8 py-24", className)}>
      <Typography.Paragraph align="center" color="muted" className="text-5xl">
        {face}
      </Typography.Paragraph>
      <Typography.Heading type="h5" align="center" color="muted">
        {title}
      </Typography.Heading>
      {description && (
        <Typography.Paragraph type="body-xs" align="center" color="muted">
          {description}
        </Typography.Paragraph>
      )}
      {children}
    </Column>
  );

  const content =
    Platform.OS === "android" ? <Row alignment="center">{column}</Row> : column;

  return isInsideHost ? content : <Host {...host}>{content}</Host>;
}
