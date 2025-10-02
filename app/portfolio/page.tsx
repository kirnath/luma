import { Header } from "@/components/header"
import { BackgroundPattern } from "@/components/background-pattern"
import { SolanaPriceFooter } from "@/components/solana-price-footer"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, ExternalLink } from "lucide-react"

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#222222] relative overflow-hidden font-kanit">
      <BackgroundPattern isPaused={false} />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="w-full max-w-[640px] mx-auto mt-10 sm:mt-16">
            <Card className="border border-slate-800/50 shadow-2xl bg-[#222222]/80 backdrop-blur-sm w-full mx-auto">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-[18px] font-semibold text-white">Portfolio</CardTitle>
                <Badge className="bg-[#b20241] text-white">Under Development</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 text-slate-300">
                  <Wrench className="w-5 h-5 mt-0.5 text-[#b20241]" />
                  <p className="text-sm opacity-90">
                    We’re building this section. Check back soon for updates.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href="https://x.com/luma_exchange"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm bg-[#b20241] text-white rounded-md px-3 py-1 hover:opacity-90"
                  >
                    Follow us on X
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="/roadmap"
                    className="inline-flex items-center gap-2 text-sm bg-[#333333] text-white rounded-md px-3 py-1 hover:bg-[#3a3a3a]"
                  >
                    View Roadmap
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <SolanaPriceFooter />
    </div>
  )
}
