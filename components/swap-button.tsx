"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { RefreshCw } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { VersionedTransaction } from "@solana/web3.js"
import { toast } from "@/hooks/use-toast"

interface Token {
  symbol: string
  name: string
  mint: string
  logoURI?: string
  decimals: number
}

interface SwapButtonProps {
  isConnected: boolean
  fromAmount: string
  fromToken: Token
  toToken: Token
  slippage: string
  onAmountChange: (amount: string) => void
  onToAmountChange: (amount: string) => void
}

export function SwapButton({
  isConnected,
  fromAmount,
  fromToken,
  toToken,
  slippage,
  onAmountChange,
  onToAmountChange,
}: SwapButtonProps) {
  const [isSwapping, setIsSwapping] = useState(false)
  const { setVisible } = useWalletModal()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const handleSwap = async () => {
    // If wallet not connected, open wallet modal instead of doing nothing
    if (!isConnected) {
      setVisible(true)
      return
    }

    if (!fromAmount) return

    try {
      if (!publicKey) return
      setIsSwapping(true)
      // Convert amount to base units
      const scaleIn = Math.pow(10, fromToken.decimals)
      const amountIn = Math.floor(Number(fromAmount) * scaleIn)
      if (!Number.isFinite(amountIn) || amountIn <= 0) {
        setIsSwapping(false)
        return
      }

      // Request swap transaction from our server (Jupiter Lite)
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inputMint: fromToken.mint,
          outputMint: toToken.mint,
          amount: String(amountIn),
          slippageBps: Math.min(500, Math.max(1, Math.round((Number(slippage) || 0.5) * 100))),
          userPublicKey: publicKey.toBase58(),
        }),
      })
      const json = await res.json()
      if (!json.success) {
        console.warn("Swap API error", json)
        toast({
          title: "Swap failed",
          description: typeof json?.error === "string" ? json.error : "Could not generate swap transaction.",
          variant: "destructive",
        })
        setIsSwapping(false)
        return
      }
      const payload = json.data || {}
      const swapTxBase64: string | undefined = payload.swapTransaction || payload.swapTx || payload.transaction
      if (!swapTxBase64) {
        console.warn("No swap transaction in response", payload)
        toast({
          title: "Swap failed",
          description: "No transaction returned by aggregator.",
          variant: "destructive",
        })
        setIsSwapping(false)
        return
      }

      const raw = Uint8Array.from(atob(swapTxBase64), (c) => c.charCodeAt(0))
      const tx = VersionedTransaction.deserialize(raw)
      const signature = await sendTransaction(tx, connection, { skipPreflight: false })
      try {
        await connection.confirmTransaction(signature, "confirmed")
      } catch (_) {
        // ignore confirmation errors
      }
      toast({
        title: "Swap submitted",
        description: (
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-400 hover:text-blue-300"
          >
            View on Solscan
          </a>
        ),
      })
      onAmountChange("")
      onToAmountChange("")
      setIsSwapping(false)
    } catch (e) {
      console.error("Swap failed", e)
      toast({
        title: "Swap failed",
        description: e instanceof Error ? e.message : "Unexpected error occurred.",
        variant: "destructive",
      })
      setIsSwapping(false)
    }
  }

  return (
    <Button
      onClick={handleSwap}
      // Allow clicking to open wallet modal when not connected
      disabled={isSwapping || (isConnected && !fromAmount)}
      className="w-full h-10 text-sm font-medium bg-[#b20241] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0"
    >
      {isSwapping ? (
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Swapping...
        </div>
      ) : !isConnected ? (
        "Connect Wallet"
      ) : !fromAmount ? (
        "Enter Amount"
      ) : (
        `Swap ${fromToken.symbol} for ${toToken.symbol}`
      )}
    </Button>
  )
}
