import { cn } from "heroui-native/utils";
import { useState } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";

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

  return (
    <View
      className={cn(
        "flex-1 items-center justify-center gap-3 px-8 py-24",
        className,
      )}
    >
      <Typography.Paragraph align="center" color="muted" className="text-5xl">
        {face}
      </Typography.Paragraph>
      <Typography.Heading type="h5" align="center">
        {title}
      </Typography.Heading>
      {description && (
        <Typography.Paragraph type="body-xs" align="center" color="muted">
          {description}
        </Typography.Paragraph>
      )}
      {children}
    </View>
  );
}
