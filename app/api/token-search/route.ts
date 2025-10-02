import { NextResponse } from "next/server";

// Proxies token search to your backend (SolanaTracker), using BACKEND_URL and BACKEND_API_KEY.
// Client calls: /api/token-search?q=keyword
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("query") || "";

    if (!q.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    const base = (process.env.BACKEND_URL || "https://data.solanatracker.io").replace(/\/$/, "");
    const apiKey = process.env.BACKEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing BACKEND_API_KEY" },
        { status: 500 }
      );
    }

    const url = `${base}/search?timeframe=24h&query=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch (_) {
      return NextResponse.json(
        { success: false, error: `Invalid JSON from backend`, body: text },
        { status: 502 }
      );
    }

    if (!res.ok || data?.status !== "success") {
      return NextResponse.json(
        { success: false, error: data?.message || data || text },
        { status: 200 }
      );
    }

    const items: any[] = Array.isArray(data?.data) ? data.data : [];
    const results = items.map((it) => ({
      name: it.name,
      symbol: it.symbol,
      address: it.mint,
      decimals: typeof it.decimals === "number" ? it.decimals : 9,
      logo_uri: it.image,
      verified: undefined,
      price: typeof it.priceUsd === "number" ? it.priceUsd : undefined,
      market_cap: typeof it.marketCapUsd === "number" ? it.marketCapUsd : undefined,
      price_change_24h_percent: undefined,
    }));

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
