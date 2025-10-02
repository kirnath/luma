"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "@/components/wallet-button"
import Image from "next/image"
// removed search from navbar
import { Coins } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { connected } = useWallet()

  return (
    <header className="border-b border-slate-800/50 backdrop-blur-sm bg-[#222222]/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src={"/logo.png"} width={40} height={40} alt="logo" />
          <h1 className="text-lg font-bold text-white font-kanit">Luma</h1>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          {[
            { href: "/", label: "Swap" },
            { href: "/preps", label: "Preps" },
            { href: "/portfolio", label: "Portfolio" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-2 py-1 rounded ${
                pathname === item.href
                  ? "text-white bg-[#333333]"
                  : "text-slate-300 hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href="/luma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-10 px-2 sm:px-3 rounded-md bg-[#b20241] text-white text-xs sm:text-sm hover:opacity-90"
          >
            <span >BUY $LUMA</span>
          </a>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
