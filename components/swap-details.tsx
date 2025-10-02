"use client"

import { TrendingUp } from "lucide-react"

interface Token {
  symbol: string
  name: string
  mint: string
  logoURI?: string
  decimals: number
}

interface SwapDetailsProps {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
}

export function SwapDetails({ fromToken, toToken, fromAmount, toAmount }: SwapDetailsProps) {
  if (!fromAmount || !toAmount) return null

  const rate = (Number(toAmount) / Number(fromAmount)).toFixed(6)

  return (
    <div className="text-[11px] text-slate-400 flex items-center gap-2">
      <span className="text-slate-300">1 {fromToken.symbol} = {rate} {toToken.symbol}</span>
      <span className="opacity-50">·</span>
      <span>Fee ~0.00025 SOL</span>
      <span className="opacity-50">·</span>
      <span className="inline-flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-[#b20241]" /> Jupiter
      </span>
    </div>
  )
}
