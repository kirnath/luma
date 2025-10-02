"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";

export function SolanaPriceFooter() {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Use pump.fun SOL price endpoint (no API key needed)
        const res = await fetch("https://frontend-api-v3.pump.fun/sol-price");
        const data = await res.json();
        const solPrice = Number(data?.solPrice);
        const mockChange = -2.34 + (Math.random() - 0.5) * 4; // Simulate 24h change
        if (!Number.isNaN(solPrice)) setPrice(solPrice);
        setChange24h(mockChange);
      } catch (e) {
        // Fallback: keep last value
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 z-20">
        <div className="bg-[#222222]/80 backdrop-blur-sm border border-slate-800/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-4 h-4 bg-[#b20241] rounded-full animate-pulse" />
            <span>Loading SOL price...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-20">
      <div className="bg-[#222222]/80 backdrop-blur-sm border border-slate-800/50 rounded-lg px-3 py-2 hover:opacity-90 transition-colors">
        <div className="flex items-center gap-2 text-xs">
          <Image src={`/chains/sol.svg`} height={10} width={10} alt="sol_logo" />
          <div className="flex items-center gap-1">
            <span className="text-slate-300 font-medium">
              ${price?.toFixed(2)}
            </span>
          </div>{" "}
          <Image src={`/logo.png`} height={10} width={10} alt="logo" />{" "}
          <div className="flex items-center gap-1">
            <span className="text-slate-300 font-medium">${0.000072}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
