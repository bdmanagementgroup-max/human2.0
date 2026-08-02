export function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative overflow-hidden py-16 md:py-20"
    >
      {/* background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl border border-white/5 bg-ink-200/30 p-8 shadow-card backdrop-blur md:p-16">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-glow/70">
            [ the manifesto ]
         </span>

          <blockquote className="mt-6 font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-ink-50/90">
              We&apos;re not replacing humans.
           </span>
            <br />
            <span className="text-gradient text-glow-cyan">
              We&apos;re building the augmented operator
           </span>{" "}
            — the one who ships{" "}
            <span className="relative inline-block">
              <span className="relative z-10">10×</span>
              <span
                className="absolute inset-x-0 bottom-1 h-3 bg-cyan-glow/30"
                aria-hidden
              />
           </span>{" "}
            with AI as a teammate.
        </blockquote>

          <div className="mt-10 grid gap-6 border-t border-white/5 pt-8 md:grid-cols-3">
            <p className="text-ink-50/65">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-cyan-glow/60">
                01 — build
             </span>
              Use AI to ship things, not to look productive. Demoware is dead.
           </p>
            <p className="text-ink-50/65">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-violet-glow/60">
                02 — own
             </span>
              Your model, your infra, your data. Self-host where it counts.
           </p>
            <p className="text-ink-50/65">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-cyan-glow/60">
                03 — share
             </span>
              Operators teach operators. The community is the curriculum.
           </p>
        </div>
      </div>
    </div>
  </section>
  );
}
