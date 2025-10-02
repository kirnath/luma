"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { SwapCard } from "@/components/swap-card"
import { StatsGrid } from "@/components/stats-grid"
import { BackgroundPattern } from "@/components/background-pattern"
import { SolanaPriceFooter } from "@/components/solana-price-footer"
import TerminalComponent from "@/components/terminal"
import Script from "next/script"

interface Token {
  symbol: string
  name: string
  mint: string
  logoURI?: string
  decimals: number
}

// Fallback tokens so UI loads instantly; replaced by /api/tokens later
const fallbackTokens: Token[] = [
  { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112", logoURI: "/chains/sol.svg", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", logoURI: "/chains/usdc.svg", decimals: 6 },
  { symbol: "USDT", name: "Tether", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", logoURI: "/chains/usdt.svg", decimals: 6 },
]

export default function SwapDApp() {
  const [isSwapCardHovered, setIsSwapCardHovered] = useState(false)
  const [tokens, setTokens] = useState<Token[]>(fallbackTokens)

  useEffect(() => {
    let alive = true
    const loadTokens = async () => {
      try {
        const res = await fetch("/api/tokens")
        const data = await res.json()
        if (alive && data.success && Array.isArray(data.tokens) && data.tokens.length) {
          // Prefer SOL first, then stablecoins, then rest
          const sorted = [...data.tokens].sort((a: Token, b: Token) => {
            const rank = (t: Token) =>
              t.symbol === "SOL" ? 0 : ["USDC", "USDT"].includes(t.symbol) ? 1 : 2
            return rank(a) - rank(b)
          })
          setTokens(sorted)
        }
      } catch (_) {
        // Keep fallback
      }
    }
    loadTokens()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#222222] relative overflow-hidden  font-kanit">
      <BackgroundPattern isPaused={isSwapCardHovered} />

        <Script
        src="https://terminal.jup.ag/main-v4.js"
        strategy="afterInteractive"
        data-preload
        onLoad={() => console.log("Jupiter script loaded successfully----------------")}
        onError={(e) => console.error("Error loading Jupiter script----------------", e)}
      />

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-6">
          <div className="w-full max-w-[640px] mx-auto mt-10 sm:mt-16">
            <SwapCard onHoverChange={setIsSwapCardHovered} tokens={tokens} />
          </div>
          <StatsGrid />
          {/* Jupiter Terminal widget */}
          <div className="mt-6">
            <TerminalComponent />
          </div>
        </main>
      </div>

      <SolanaPriceFooter />
    </div>
  )
}
