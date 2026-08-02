import { Cpu, Network, Zap, Brain, Boxes, Rocket } from "lucide-react";

/**
 * Decorative orbital anim for hero — pure CSS, no client state.
 * Layers: gradient blob + animated rings + floating chips positioned on rings.
 */
export function Orbital() {
  const ringIcons = [
    { Icon: Cpu, color: "text-cyan-glow", angle: 0 },
    { Icon: Network, color: "text-violet-glow", angle: 60 },
    { Icon: Zap, color: "text-cyan-glow", angle: 120 },
    { Icon: Brain, color: "text-violet-glow", angle: 180 },
    { Icon: Boxes, color: "text-cyan-glow", angle: 240 },
    { Icon: Rocket, color: "text-violet-glow", angle: 300 },
  ];

  return (
    <div
      className="relative mx-auto hidden aspect-square w-full max-w-[560px] lg:block"
      aria-hidden
    >
      {/* Central glow */}
      <div
        className="absolute inset-[28%] rounded-full bg-gradient-radial from-cyan-glow/30 via-cyan-glow/5 to-transparent blur-2xl animate-glow"
        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.4) 0%, transparent 65%)" }}
      />

      {/* Outer ring */}
      <div className="absolute inset-[6%] rounded-full border border-white/5 animate-orbit-slow">
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-glow shadow-glow-cyan" />
    </div>

      {/* Middle ring */}
      <div className="absolute inset-[18%] rounded-full border border-white/8 animate-orbit-reverse">
        <div className="absolute top-1/2 -right-1.5 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-violet-glow shadow-glow-violet" />
    </div>

      {/* Inner ring */}
      <div className="absolute inset-[32%] rounded-full border border-white/10 animate-orbit-slow" />

      {/* Floating icon chips on outer ring */}
      {ringIcons.map((item, i) => {
        const rad = (item.angle * Math.PI) / 180;
        const r = 47; // % of container (just inside outer ring)
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        return (
          <div
            key={i}
            className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-ink-200/80 shadow-card backdrop-blur-md animate-float"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <item.Icon className={`h-5 w-5 ${item.color}`} strokeWidth={1.6} />
      </div>
        );
      })}
  </div>
  );
}
