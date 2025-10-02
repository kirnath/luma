"use client"

import { useState, useEffect, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowUpDown, RefreshCw } from "lucide-react"
import { TokenInput } from "@/components/token-input"
import { SwapButton } from "@/components/swap-button"
import { SwapDetails } from "@/components/swap-details"

interface Token {
  symbol: string
  name: string
  mint: string
  logoURI?: string
  decimals: number
}

interface SwapCardProps {
  onHoverChange: (isHovered: boolean) => void
  tokens: Token[]
}

export function SwapCard({ onHoverChange, tokens }: SwapCardProps) {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const MIN_SLIPPAGE = 0.01
  const MAX_SLIPPAGE = 5.0
  const [fromBalance, setFromBalance] = useState<number>(0)
  const [toBalance, setToBalance] = useState<number>(0)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [fromUsdValue, setFromUsdValue] = useState<string>("")
  const [toUsdValue, setToUsdValue] = useState<string>("")

  const cardRef = useRef<HTMLDivElement>(null)

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  // Initialize tokens when provided
  useEffect(() => {
    if (!fromToken && !toToken && tokens && tokens.length >= 2) {
      setFromToken(tokens[0])
      setToToken(tokens[1])
    }
  }, [tokens, fromToken, toToken])

  useEffect(() => {
    const quote = async () => {
      if (!fromAmount || isNaN(Number(fromAmount)) || !fromToken || !toToken) {
        setToAmount("");
        return;
      }
      try {
        // Convert human amount to base units (integer)
        const scaleIn = Math.pow(10, fromToken.decimals);
        const amountIn = Math.floor(Number(fromAmount) * scaleIn).toString();
        const sVal = Number(slippage) || 0.5
        const sClamped = Math.min(MAX_SLIPPAGE, Math.max(MIN_SLIPPAGE, sVal))
        const bps = String(Math.max(1, Math.round(sClamped * 100)));
        const params = new URLSearchParams({ inputMint: fromToken.mint, outputMint: toToken.mint, amount: amountIn, slippageBps: bps, swapMode: "ExactIn" });

        // Try client-side direct Jupiter first (better reliability, CORS is allowed)
        let outAmount: number | null = null;
        try {
          const direct = await fetch(`https://lite-api.jup.ag/swap/v1/quote?${params.toString()}`);
          if (direct.ok) {
            const dj = await direct.json();
            const payload = dj?.data || dj;
            if (payload?.outAmount) outAmount = Number(payload.outAmount);
            if (payload?.swapUsdValue !== undefined) {
              const usd = Number(payload.swapUsdValue);
              if (!Number.isNaN(usd)) {
                setFromUsdValue(usd.toFixed(2));
                setToUsdValue(usd.toFixed(2));
              }
            }
          }
        } catch (_) {
          // ignore and fallback to server proxy
        }

        if (outAmount === null) {
          const res = await fetch(`/api/quote?${params.toString()}`);
          const json = await res.json();
          if (!json.success || !json.data || !json.data.outAmount) {
            console.warn('Quote error', json);
            setToAmount("");
            return;
          }
          outAmount = Number(json.data.outAmount);
          if (json.data?.swapUsdValue !== undefined) {
            const usd = Number(json.data.swapUsdValue);
            if (!Number.isNaN(usd)) {
              setFromUsdValue(usd.toFixed(2));
              setToUsdValue(usd.toFixed(2));
            }
          }
        }

        const scaleOut = Math.pow(10, toToken.decimals);
        const outUi = (outAmount || 0) / scaleOut;
        setToAmount(outUi.toFixed(6));
      } catch (e) {
        setToAmount("");
        setFromUsdValue("");
        setToUsdValue("");
      }
    };
    quote();
  }, [fromAmount, fromToken, toToken, slippage])

  // Fetch balances for current tokens
  useEffect(() => {
    const fetchBalance = async (token: Token | null, setter: (n: number) => void) => {
      try {
        if (!token || !connection) return setter(0)
        const wallet = publicKey
        if (!wallet) return setter(0)
        // Native SOL
        if (token.symbol === "SOL") {
          const lamports = await connection.getBalance(wallet)
          return setter(lamports / 1e9)
        }
        // SPL token account balance via parsed accounts
        const owner = wallet as PublicKey
        const mint = new PublicKey(token.mint)
        const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint })
        const total = resp.value.reduce((sum, acc) => {
          const info: any = acc.account.data.parsed.info
          const amount = Number(info.tokenAmount?.uiAmount || 0)
          return sum + amount
        }, 0)
        setter(total)
      } catch {
        setter(0)
      }
    }
    fetchBalance(fromToken, setFromBalance)
    fetchBalance(toToken, setToBalance)
  }, [connection, connected, fromToken, toToken])

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseEnter = () => onHoverChange(true)
    const handleMouseLeave = () => onHoverChange(false)

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [onHoverChange])

  return (
    <Card ref={cardRef} className="border border-slate-800/50 shadow-2xl bg-[#222222]/80 backdrop-blur-sm w-full mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[18px] font-semibold text-white">Swap</CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Badge variant="outline" className="text-[11px] bg-[#222222] text-slate-300 border-slate-700 cursor-pointer">
                  Slippage: {Number(slippage || "0.5").toFixed(2)}%
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-[#222222] border-slate-700 text-slate-200">
                <div className="text-xs mb-2 text-slate-300">Select slippage</div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {(["0.1", "0.5", "1", "2"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSlippage(opt)}
                      className={`h-8 rounded-md text-xs border ${slippage === opt ? "bg-[#b20241]/20 border-[#b20241] text-[#b20241]" : "bg-[#222222] border-slate-700 hover:bg-[#333333]"}`}
                    >
                      {opt}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={MIN_SLIPPAGE}
                    max={MAX_SLIPPAGE}
                    step={0.01}
                    value={slippage}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (raw === "") return setSlippage("")
                      const n = Number(raw)
                      if (!Number.isFinite(n)) return
                      const clamped = Math.min(MAX_SLIPPAGE, Math.max(MIN_SLIPPAGE, n))
                      setSlippage(String(clamped))
                    }}
                    className="w-full h-8 rounded-md bg-[#222222] border border-slate-700 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#b20241]"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
                {Number(slippage) > 2 && (
                  <div className="mt-2 text-[11px] text-amber-400">
                    High slippage may cause poor pricing or MEV.
                  </div>
                )}
                {Number(slippage) < MIN_SLIPPAGE && (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Minimum slippage is {MIN_SLIPPAGE}% (values are clamped).
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <RefreshCw className="w-4 h-4 text-white hover:animate-spin hover:cursor-pointer"/>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {fromToken && toToken && (
          <TokenInput
            label="From"
            token={fromToken}
            amount={fromAmount}
            onAmountChange={setFromAmount}
            onTokenChange={(t) => setFromToken(t)}
            tokens={tokens}
            balanceText={fromBalance.toFixed(2)}
            showMax
            onMax={() => setFromAmount(fromBalance.toString())}
            subtitle={fromUsdValue ? `≈ $${fromUsdValue}` : '≈ $0.00'}
          />
        )}

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full w-10 h-10 p-0 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {fromToken && toToken && (
          <TokenInput
            label="To"
            token={toToken}
            amount={toAmount}
            onAmountChange={() => {}}
            onTokenChange={(t) => setToToken(t)}
            tokens={tokens}
            readOnly
            balanceText={toBalance.toFixed(2)}
            subtitle={toUsdValue ? `≈ $${toUsdValue}` : '≈ $0.00'}
          />
        )}

        <Separator className="my-4 bg-slate-800" />

        {fromToken && toToken && (
          <SwapDetails fromToken={fromToken} toToken={toToken} fromAmount={fromAmount} toAmount={toAmount} />
        )}

        {fromToken && toToken && (
          <SwapButton
            isConnected={connected}
            fromAmount={fromAmount}
            fromToken={fromToken}
            toToken={toToken}
            slippage={slippage}
            onAmountChange={setFromAmount}
            onToAmountChange={setToAmount}
          />
        )}
      </CardContent>
    </Card>
  )
}
