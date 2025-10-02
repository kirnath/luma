import { NextResponse } from "next/server";

// Returns a list of popular tokens based on 24h volume from SolanaTracker.
// Reads BACKEND_URL and BACKEND_API_KEY from env, includes key as x-api-key.
// Falls back to Jupiter token list if SolanaTracker fails or env is missing.
export async function GET() {
  const baseUrl = (process.env.BACKEND_URL || "https://data.solanatracker.io").replace(/\/$/, "");
  const apiKey = process.env.BACKEND_API_KEY;

  if (!apiKey) {
    // If no key, still try to keep app usable via Jupiter fallback.
    try {
      const res = await fetch("https://token.jup.ag/all", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch Jupiter token list");
      const data = await res.json();
      const tokens = Array.isArray(data) ? data : [];
      const mapped = tokens
        .filter((t: any) => t?.address && t?.symbol)
        .map((t: any) => ({
          symbol: t.symbol,
          name: t.name || t.symbol,
          mint: t.address,
          logoURI: t.logoURI || undefined,
          decimals: Number.isFinite(t.decimals) ? t.decimals : 9,
        }));
      return NextResponse.json({ success: true, tokens: mapped, note: "Using Jupiter fallback; set BACKEND_API_KEY to enable SolanaTracker volume ranking." });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: "Missing BACKEND_API_KEY and Jupiter fallback failed." },
        { status: 500 }
      );
    }
  }

  try {
    const res = await fetch(`${baseUrl}/tokens/volume/24h`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SolanaTracker error: ${text}`);
    }

    const data = await res.json();
    const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    const seen = new Set<string>();
    const mapped = items
      .map((row: any) => {
        const tok = row?.token ?? row;
        const address = tok?.mint || tok?.address || tok?.mintAddress || tok?.token_address || tok?.tokenAddress;
        const symbol = tok?.symbol || tok?.ticker || tok?.tokenSymbol;
        const name = tok?.name || tok?.tokenName || symbol;
        const decimals = Number.isFinite(tok?.decimals) ? tok.decimals : 9;
        const logoURI = tok?.logoURI || tok?.logo || tok?.image || tok?.icon;
        if (!address || !symbol) return null;
        if (seen.has(address)) return null;
        seen.add(address);
        return { symbol, name, mint: address, logoURI, decimals };
      })
      .filter(Boolean) as Array<{ symbol: string; name: string; mint: string; logoURI?: string; decimals: number }>;

    // Ensure SOL appears first if present, then USDC/USDT, then by volume order as given
    const prioritized = [...mapped].sort((a, b) => {
      const rank = (x: any) => (x.symbol === "SOL" ? 0 : ["USDC", "USDT"].includes(x.symbol) ? 1 : 2);
      return rank(a) - rank(b);
    });

    return NextResponse.json({ success: true, tokens: prioritized });
  } catch (err: any) {
    // Fallback to Jupiter token list
    try {
      const res = await fetch("https://token.jup.ag/all", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch Jupiter token list");
      const data = await res.json();
      const tokens = Array.isArray(data) ? data : [];
      const mapped = tokens
        .filter((t: any) => t?.address && t?.symbol)
        .map((t: any) => ({
          symbol: t.symbol,
          name: t.name || t.symbol,
          mint: t.address,
          logoURI: t.logoURI || undefined,
          decimals: Number.isFinite(t.decimals) ? t.decimals : 9,
        }));
      return NextResponse.json({ success: true, tokens: mapped, note: "SolanaTracker failed; using Jupiter fallback." });
    } catch (fallbackErr: any) {
      return NextResponse.json(
        { success: false, error: fallbackErr?.message || err?.message || "Unknown error" },
        { status: 502 }
      );
    }
  }
}
