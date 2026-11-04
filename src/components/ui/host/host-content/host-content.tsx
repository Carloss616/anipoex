/** Only Compose needs a content color: see `host-content.android.tsx`. */
export function HostContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
