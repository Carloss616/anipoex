import { type ReactNode, Suspense, use } from "react";

const NEVER = new Promise<never>(() => {});

export interface FrozenProps {
  frozen: boolean;
  children: ReactNode;
}

/**
 * Hides its children without unmounting them. Not `<Activity hidden>`: it
 * unsubscribes every `useValue` inside, and a `memo` row comes back stale.
 * Suspense only disconnects layout effects, so nothing measures meanwhile.
 * @see https://github.com/software-mansion/react-freeze/blob/main/src/index.tsx
 */
export function Frozen({ frozen, children }: FrozenProps) {
  return (
    <Suspense fallback={null}>
      <Suspender frozen={frozen}>{children}</Suspender>
    </Suspense>
  );
}

function Suspender({ frozen, children }: FrozenProps) {
  if (frozen) use(NEVER);
  return children;
}
