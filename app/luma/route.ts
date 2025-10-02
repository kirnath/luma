import { NextResponse } from "next/server"

export async function GET() {
  const mint = process.env.LUMA_MINT_ADDRESS || process.env.NEXT_PUBLIC_LUMA_MINT_ADDRESS
  const target = mint
    ? `https://pump.fun/coin/${encodeURIComponent(mint)}`
    : `https://pump.fun/`
  return NextResponse.redirect(target, { status: 302 })
}

