/** How long ago `createdAt` (in seconds, as AniList gives it) was, short: "5m ago". */
export function timeAgo(createdAt: number, now = Date.now()) {
  const minutes = Math.floor((now / 1000 - createdAt) / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
