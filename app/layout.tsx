import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont  from "next/font/local"
import "./globals.css"
import { WalletContextProvider } from "@/components/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

const kanit = localFont({
    src: './Kanit-Regular.ttf',
    variable: '--font-kanit'
})

export const metadata: Metadata = {
  title: "Luma Exchange",
  description: "Faster Swap no Luma"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <head>
      </head>
      <body className={kanit.variable}>
        <WalletContextProvider>
          {children}
          <Toaster />
        </WalletContextProvider>
      </body>
    </html>
  )
}
