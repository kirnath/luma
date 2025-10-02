"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Token {
  symbol: string
  name: string
  mint: string
  logoURI?: string
  decimals: number
}

interface TokenChartModalProps {
  isOpen: boolean
  onClose: () => void
  token: Token | null
}

export function TokenChartModal({ isOpen, onClose, token }: TokenChartModalProps) {
  const title = token ? `${token.symbol} • ${token.name}` : "Token Chart"
  const src = token
    ? `https://dexscreener.com/solana/token/${token.mint}?embed=1&theme=dark`
    : undefined

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-3xl w-[95vw] h-[80vh] p-0 overflow-hidden bg-[#222222]">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-white text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="w-full h-full">
          {src ? (
            <iframe
              src={src}
              className="w-full h-full border-0"
              allow="clipboard-write; clipboard-read;"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              No token selected
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

