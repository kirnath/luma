import { NextResponse } from "next/server";

// Proxies Jupiter quote API to avoid CORS and handle params safely
// GET /api/quote?inputMint=...&outputMint=...&amount=...&slippageBps=50
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount"); // integer, base units
    const slippageBps = searchParams.get("slippageBps") ?? "50"; // default 0.5%

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing inputMint/outputMint/amount" },
        { status: 400 }
      );
    }

    // Use Jupiter Lite API by default; can be overridden via env
    const base = (process.env.JUPITER_QUOTE_URL || "https://lite-api.jup.ag/swap/v1/quote").replace(/\/$/, "");
    const url = new URL(base);
    url.searchParams.set("inputMint", inputMint);
    url.searchParams.set("outputMint", outputMint);
    url.searchParams.set("amount", amount);
    url.searchParams.set("slippageBps", slippageBps);

    const headers = { accept: "application/json", "user-agent": "LumaExchange/1.0" } as Record<string, string>;

    let res = await fetch(url.toString(), { cache: "no-store", headers });
    if (!res.ok) {
      // Retry once with the older lite path if configured path 404s
      const fallback = new URL("https://lite-api.jup.ag/v1/quote");
      fallback.searchParams.set("inputMint", inputMint);
      fallback.searchParams.set("outputMint", outputMint);
      fallback.searchParams.set("amount", amount);
      fallback.searchParams.set("slippageBps", slippageBps);
      res = await fetch(fallback.toString(), { cache: "no-store", headers });
    }
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) {
        return NextResponse.json(
          { success: false, status: res.status, error: data?.error ?? data, url: url.toString() },
          { status: 200 }
        );
      }
      // Normalize shape: some endpoints nest under data
      const payload = data?.data || data;
      return NextResponse.json({ success: true, data: payload });
    } catch (_) {
      if (!res.ok) {
        return NextResponse.json(
          { success: false, status: res.status, error: text, url: url.toString() },
          { status: 200 }
        );
      }
      return NextResponse.json({ success: true, data: text });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
