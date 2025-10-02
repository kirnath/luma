import { HexagonParticles } from "@/components/hexagon-particles"

interface BackgroundPatternProps {
  isPaused: boolean
}

export function BackgroundPattern({ isPaused }: BackgroundPatternProps) {
  return (
    <>
      {/* Existing gradient and patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#222222] via-[#222222] to-[#b20241]/20" />

      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(178, 2, 65, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(178, 2, 65, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(178, 2, 65, 0.1) 2px,
            rgba(178, 2, 65, 0.1) 4px
          )`,
          }}
        />
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#b20241]/5 rounded-full blur-3xl" />

      {/* Add hexagon particles */}
      <HexagonParticles isPaused={isPaused} />
    </>
  )
}
