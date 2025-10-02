import { promises as fs } from "fs"
import path from "path"
import { Header } from "@/components/header"
import { BackgroundPattern } from "@/components/background-pattern"
import { SolanaPriceFooter } from "@/components/solana-price-footer"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Section = { title: string; items: string[] }

async function loadRoadmap(): Promise<string> {
  const p = path.join(process.cwd(), "roadmap.md")
  try {
    const buf = await fs.readFile(p)
    return buf.toString("utf-8")
  } catch (e) {
    return "Q4 2025 – Current\nRoadmap file missing."
  }
}

function parseRoadmap(text: string): Section[] {
  const lines = text.split(/\r?\n/)
  const sections: Section[] = []
  let current: Section | null = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Detect headers like "Q4 2025 – Current" (ignore any leading emoji)
    const headerMatch = line.match(/(Q\d[^\n]*)/)
    if (headerMatch) {
      const title = headerMatch[1].trim()
      current = { title, items: [] }
      sections.push(current)
      continue
    }

    if (!current) {
      // If items appear before a detected quarter, create a Misc section
      current = { title: "Roadmap", items: [] }
      sections.push(current)
    }

    current.items.push(line)
  }
  return sections
}

export default async function RoadmapPage() {
  const content = await loadRoadmap()
  const sections = parseRoadmap(content)
  return (
    <div className="min-h-screen bg-[#222222] relative overflow-hidden font-kanit">
      <BackgroundPattern isPaused={false} />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto mt-10 sm:mt-16">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Roadmap</h2>
              <p className="text-sm text-slate-300 mt-1">What we’ve shipped and what’s next.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((sec, idx) => {
                const isCurrent = /Current/i.test(sec.title)
                const isFuture = /Q\d\s+20(2\d|3\d|4\d)/.test(sec.title)
                return (
                  <Card key={idx} className="border border-slate-800/50 shadow-2xl bg-[#222222]/80 backdrop-blur-sm">
                    <CardHeader className="pb-2 flex items-center justify-between">
                      <CardTitle className="text-[16px] font-semibold text-white">
                        {sec.title.replace(/^\W+/, "")}
                      </CardTitle>
                      {isCurrent ? (
                        <Badge className="bg-[#b20241] text-white">Current</Badge>
                      ) : null}
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc marker:text-[#b20241] pl-5 space-y-2 text-slate-200 text-sm">
                        {sec.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
      <SolanaPriceFooter />
    </div>
  )
}
