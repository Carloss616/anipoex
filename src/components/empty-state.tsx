import { cn } from "panelui-native/utils/cn";
import { useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Center } from "./layout/center";

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

  return (
    <Center className={cn("gap-3 px-8 py-24", className)}>
      <Typography align="center" muted className="text-5xl">
        {face}
      </Typography>
      <Typography type="h5" weight="medium" align="center" muted>
        {title}
      </Typography>
      {description && (
        <Typography type="body-xs" align="center" muted>
          {description}
        </Typography>
      )}
      {children}
    </Center>
  );
}
