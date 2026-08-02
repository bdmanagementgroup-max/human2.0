"use client";

import { SubscribeButton } from "@/app/components/SubscribeButton";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      {/* glowing backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, rgba(0,229,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-3xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-200/90 to-ink-300/90 p-10 text-center shadow-card backdrop-blur md:p-16">
          {/* shimmer */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/60 to-transparent"
            aria-hidden
          />

          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-glow/70">
            [ become human 2.0 ]
          </span>

          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            <span className="block">Operators don&apos;t wait</span>
            <span className="text-gradient text-glow-cyan">for the future</span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-ink-50/65 md:text-lg">
            One subscription. The whole community. Every workshop, every
            template, every build.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <SubscribeButton label="Get Full Access" size="lg" />
            <p className="font-mono text-xs text-ink-50/40">
              $29 / month · cancel anytime · 30-day refund
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}