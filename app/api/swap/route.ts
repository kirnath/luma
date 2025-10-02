import { NextResponse } from "next/server";

// Creates a Jupiter swap transaction for the client to sign and send
// POST /api/swap { inputMint, outputMint, amount, slippageBps?, userPublicKey }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const inputMint = body.inputMint as string | undefined;
    const outputMint = body.outputMint as string | undefined;
    const amount = body.amount as string | undefined; // integer, base units
    const slippageBps = (body.slippageBps as string | number | undefined) ?? 50; // default 0.5%
    const userPublicKey = body.userPublicKey as string | undefined;

    if (!inputMint || !outputMint || !amount || !userPublicKey) {
      return NextResponse.json(
        { success: false, error: "Missing inputMint/outputMint/amount/userPublicKey" },
        { status: 400 }
      );
    }

    // 1) Fetch a quote from Jupiter Lite API (same as /api/quote)
    const quoteBase = (process.env.JUPITER_QUOTE_URL || "https://lite-api.jup.ag/swap/v1/quote").replace(/\/$/, "");
    const qurl = new URL(quoteBase);
    qurl.searchParams.set("inputMint", inputMint);
    qurl.searchParams.set("outputMint", outputMint);
    qurl.searchParams.set("amount", amount);
    qurl.searchParams.set("slippageBps", String(slippageBps));

    const headers = { accept: "application/json", "user-agent": "LumaExchange/1.0" } as Record<string, string>;

    let qres = await fetch(qurl.toString(), { cache: "no-store", headers });
    if (!qres.ok) {
      // fallback to older lite path
      const fallback = new URL("https://lite-api.jup.ag/v1/quote");
      fallback.searchParams.set("inputMint", inputMint);
      fallback.searchParams.set("outputMint", outputMint);
      fallback.searchParams.set("amount", amount);
      fallback.searchParams.set("slippageBps", String(slippageBps));
      qres = await fetch(fallback.toString(), { cache: "no-store", headers });
    }
    const qtext = await qres.text();
    let quote: any;
    try {
      const parsed = JSON.parse(qtext);
      if (!qres.ok) {
        return NextResponse.json({ success: false, stage: "quote", error: parsed?.error ?? parsed }, { status: 200 });
      }
      quote = parsed?.data || parsed;
    } catch (_) {
      if (!qres.ok) {
        return NextResponse.json({ success: false, stage: "quote", error: qtext }, { status: 200 });
      }
      quote = qtext;
    }

    if (!quote) {
      return NextResponse.json({ success: false, stage: "quote", error: "No quote returned" }, { status: 200 });
    }

    // 2) Create swap transaction via Jupiter Lite Swap API
    const swapBase = (process.env.JUPITER_SWAP_URL || "https://lite-api.jup.ag/swap/v1/swap").replace(/\/$/, "");
    const sres = await fetch(swapBase, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      cache: "no-store",
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });

    const stext = await sres.text();
    try {
      const data = JSON.parse(stext);
      if (!sres.ok) {
        return NextResponse.json({ success: false, stage: "swap", error: data?.error ?? data }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: data });
    } catch (_) {
      if (!sres.ok) {
        return NextResponse.json({ success: false, stage: "swap", error: stext }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: stext });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

