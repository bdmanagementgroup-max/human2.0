import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Orbital } from "./Orbital";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 pb-16 md:pt-12 md:pb-20">
      {/* Background grid + radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,229,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(circle at 50% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 30%, black 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          className="-translate-x-1/3 absolute top-40 left-1/4 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(0,229,255,0.45) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        {/* Left: copy */}
        <div>
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-glow opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-glow"></span>
           </span>
            <span className="font-mono text-cyan-glow">v2.0 live</span>
            <span className="text-ink-50/50">·</span>
            <span className="text-ink-50/70">weekly drops · 2,400+ members</span>
         </div>

          {/* Headline */}
          <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
            <span className="block">The next version</span>
            <span className="block">of you runs on</span>
            <span className="text-gradient text-glow-cyan inline-block">AI</span>
         </h1>

          {/* Subhead */}
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-50/70 md:text-xl">
            human2.0 is the operator&apos;s community for shipping AI-powered
            businesses — from self-hosted infrastructure and autonomous agents
            to the latest video models, voice clones, and marketing stacks.
         </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-glow text-ink font-bold rounded-lg hover:bg-cyan-glow/90 transition-colors text-lg"
            >
              Get Full Access <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#manifesto"
              className="group inline-flex items-center gap-2 text-sm text-ink-50/70 hover:text-ink-50"
            >
              See what&apos;s inside
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ink-50/50">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-glow/80" />
              Cancel anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-glow/80" />
              New workshop every Wednesday
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono text-cyan-glow/80">10</span>
              <span>tracks · beginner to advanced</span>
            </span>
          </div>
        </div>

        {/* Right: orbital visual */}
        <div className="relative">
          <Orbital />
          {/* Floating tag */}
          <div className="absolute right-6 bottom-6 font-mono text-[10px] uppercase tracking-widest text-cyan-glow/60 lg:right-0">
            <span className="animate-pulse">●</span> systems online
          </div>
       </div>
     </div>
   </section>
  );
}