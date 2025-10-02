import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Wallet } from "lucide-react"

export function WalletButton() {
  const { connected, publicKey } = useWallet()
  const [isClient, setIsClient] = useState(false)

  // Set `isClient` to true after the component is mounted on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null // Avoid rendering on the server

  return (
    <div className="wallet-adapter-button-trigger">
      <WalletMultiButton
        style={{
          background: connected
            ? "rgba(178, 2, 65, 0.2)"
            : "#b20241",
          border: connected ? "1px solid #b20241" : "none",
          borderRadius: "0.5rem",
          color: "white",
          fontSize: "14px",
          fontWeight: "500",
          height: "40px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s",
        }}
      >
        <Wallet className="w-4 h-4" />
        {connected ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}` : "Connect Wallet"}
      </WalletMultiButton>
    </div>
  )
}
