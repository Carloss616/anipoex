import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";

export function Home() {
  return (
    <EmptyState
      title="Nothing here"
      description="Work in progress, check back later..."
    >
      <ThemeToggle />
    </EmptyState>
  );
}
