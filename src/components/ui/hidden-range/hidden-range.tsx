import type { ReactNode } from "react";

export interface HiddenRangeProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onChange: (value: number) => void;
  children: ReactNode;
}

/** Native sliders and ratings take the platform's own adjust actions. */
export function HiddenRange({ children }: HiddenRangeProps) {
  return <>{children}</>;
}
