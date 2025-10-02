"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { TokenSearchPopup } from "@/components/token-search-popup"
import Image from "next/image"

interface Token {
  symbol: string
  name: string
  mint: string
  logoURI?: string
  decimals: number
}

interface TokenInputProps {
  label: string
  token: Token
  amount: string
  onAmountChange: (amount: string) => void
  onTokenChange: (token: Token) => void
  tokens: Token[]
  readOnly?: boolean
  balanceText?: string
  showMax?: boolean
  onMax?: () => void
  subtitle?: string
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenChange,
  tokens,
  readOnly = false,
  balanceText,
  showMax,
  onMax,
  subtitle,
}: TokenInputProps) {
  const [showSearchPopup, setShowSearchPopup] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleTokenSelect = (selectedToken: Token) => {
    onTokenChange(selectedToken)
    setShowSearchPopup(false)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        {balanceText && <span className="text-[11px]">Balance {balanceText}</span>}
      </div>
      <div className="relative">
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={readOnly}
          className="pr-40 text-sm h-10 font-medium border-slate-800 bg-[#222222]/60 text-white placeholder:text-slate-500 focus:border-[#b20241]"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showMax && (
            <button
              type="button"
              onClick={onMax}
              className="h-8 px-2 rounded bg-slate-800 text-[11px] text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              MAX
            </button>
          )}
          <button
            ref={triggerRef}
            onClick={() => setShowSearchPopup(true)}
            className="w-24 h-8 border border-slate-700 bg-[#222222] text-white hover:opacity-90 rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
              {token.logoURI ? (
                                    <Image
                                      src={token.logoURI}
                                      width={12}
                                      height={12}
                                      alt={token.name}
                                    />
                                  ) : (
                                    <div className="w-4 h-4 bg-[#b20241] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[7px] font-bold">{token.symbol.charAt(0)}</span>
              </div>
                                  )}
            <span className="truncate text-xs">{token.symbol}</span>
          </button>
        </div>

        <TokenSearchPopup
          isOpen={showSearchPopup}
          onClose={() => setShowSearchPopup(false)}
          onTokenSelect={handleTokenSelect}
          triggerRef={triggerRef}
          popularTokens={tokens}
        />
      </div>
      {subtitle && (
        <div className="text-[11px] text-slate-500 pl-1">{subtitle}</div>
      )}
    </div>
  )
}
