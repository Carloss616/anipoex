/** Only Compose needs a content color pushed down; see `host-content.android.tsx`. */
export function HostContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
