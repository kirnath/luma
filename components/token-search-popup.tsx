"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { formatMarketCap } from "@/lib/format-marketcap";

interface Token {
  symbol: string;
  name: string;
  mint: string;
  logoURI?: string;
  decimals: number;
  price?: number;
  price_change_24h_percent?: number;
  verified?: boolean;
}

interface SearchResult {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logo_uri?: string;
  verified?: boolean;
  price?: number;
  market_cap?: number;
  price_change_24h_percent?: number;
}

interface TokenSearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSelect: (token: Token) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  popularTokens: Token[];
}

export function TokenSearchPopup({
  isOpen,
  onClose,
  onTokenSelect,
  triggerRef,
  popularTokens,
}: TokenSearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate popup position
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setPosition({
        top:  0,
        left: 0,
      });
    }
  }, [isOpen, triggerRef]);

  // Focus search input when popup opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !triggerRef?.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Search function with debounce
  const searchTokens = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/token-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchTokens(searchQuery);
      }, 800); // Wait 800ms after user stops typing
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchTokens]);

  const handleTokenClick = (result: SearchResult) => {
    const token: Token = {
      symbol: result.symbol,
      name: result.name,
      mint: result.address,
      logoURI: result.logo_uri,
      decimals: result.decimals,
      price: result.price,
      price_change_24h_percent: result.price_change_24h_percent,
    };
    onTokenSelect(token);
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toExponential(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#222222]/20 backdrop-blur-sm z-40" />

      {/* Popup */}
      <div
        ref={popupRef}
        className={cn(
          "fixed z-50 w-full bg-[#222222] border border-slate-700 rounded-lg shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            ref={searchInputRef}
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea className="max-h-80">
          <div className="p-2">
            {/* Popular tokens when no search */}
            {!searchQuery && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Popular Tokens
                </div>
                {popularTokens.map((token) => (
                  <button
                    key={token.mint}
                    onClick={() => onTokenSelect(token)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-md transition-colors text-left"
                  >
                    {token.logoURI ? (
                      <Image
                        src={token.logoURI}
                        width={24}
                        height={24}
                        alt={token.name}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#b20241] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {token.symbol.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {token.name}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-400">Searching...</span>
              </div>
            )}

            {/* Search results */}
            {searchQuery && !isLoading && searchResults.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Search Results
                </div>
                {searchResults.map((result) => (
                  <button
                    key={result.address}
                    onClick={() => handleTokenClick(result)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-md transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {result.logo_uri ? (
                        <img
                          src={result.logo_uri || "/placeholder.svg"}
                          alt={result.symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={cn(
                          "w-full h-full bg-[#b20241] flex items-center justify-center",
                          result.logo_uri && "hidden"
                        )}
                      >
                        <span className="text-white text-xs font-bold">
                          {result.symbol.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">
                          {result.symbol}
                        </span>
                        {result.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {result.name}
                      </div>
                    </div>
                    {result.price && (
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {formatMarketCap(result.market_cap || 0)}
                        </div>
                        {result.price_change_24h_percent !== undefined && (
                          <div
                            className={cn(
                              "text-xs flex items-center gap-1",
                              result.price_change_24h_percent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            )}
                          >
                            <TrendingUp
                              className={cn(
                                "w-3 h-3",
                                result.price_change_24h_percent < 0 &&
                                  "rotate-180"
                              )}
                            />
                            {Math.abs(result.price_change_24h_percent).toFixed(
                              1
                            )}
                            %
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </>
            )}

            {/* No results */}
            {searchQuery && !isLoading && searchResults.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No tokens found</div>
                <div className="text-xs">Try a different search term</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
