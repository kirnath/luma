export function formatMarketCap(cap: number) {
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(2)}B`;
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}M`;
  if (cap >= 1_000) return `$${(cap / 1_000).toFixed(2)}K`;
  return `$${cap.toFixed(2)}`;
}
