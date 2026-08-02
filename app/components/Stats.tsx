interface Stat {
  value: string;
  label: string;
  sub: string;
}

const stats: Stat[] = [
  { value: "2,400+", label: "Members", sub: "operators shipping AI in prod" },
  { value: "48", label: "Workshops shipped", sub: "watch live or saved" },
  { value: "10", label: "Topic tracks", sub: "infra → video → agents" },
];

export function Stats() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-ink-200/40 p-8"
            >
              <div
                className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-50 blur-3xl"
                style={{
                  background:
                    i === 1
                      ? "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)"
                      : "radial-gradient(circle, rgba(0,229,255,0.4), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="font-display text-5xl font-semibold tracking-tight text-glow-cyan md:text-6xl">
                  {s.value}
            </div>
                <div className="mt-3 font-medium text-ink-50">{s.label}</div>
                <div className="mt-1 text-sm text-ink-50/55">{s.sub}</div>
          </div>
        </div>
          ))}
    </div>
  </div>
  </section>
  );
}
