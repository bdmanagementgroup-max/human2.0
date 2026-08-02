import {
  CalendarDays,
  Hammer,
  Wand2,
  MessageSquareLock,
  GraduationCap,
  Layers,
  type LucideIcon,
} from "lucide-react";

interface Benefit {
  Icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
}

const benefits: Benefit[] = [
  {
    Icon: CalendarDays,
    tag: "weekly",
    title: "Wednesday Workshops",
    body:
      "Live, no-fluff deep-dives on a single AI tool or workflow. Watch live or on-demand. Take notes directly in chat.",
  },
  {
    Icon: Hammer,
    tag: "build with us",
    title: "Office Hours & Live Builds",
    body:
      "Drop in, ship something. Members build alongside the team and walk away with a working stack — not just ideas.",
  },
  {
    Icon: Layers,
    tag: "downloads",
    title: "Templates, Prompts, Playbooks",
    body:
      "A growing library of the exact prompts, configs, infra recipes, and SOPs we use ourselves. Plug-and-play.",
  },
  {
    Icon: MessageSquareLock,
    tag: "private",
    title: "Private Community Chat",
    body:
      "A tight, vetted feed of operators shipping AI in production. No noise. Lurkers welcome, builders celebrated.",
  },
  {
    Icon: Wand2,
    tag: "vetted",
    title: "Tool & Model Reviews",
    body:
      "Honest benchmarks on the latest models — Sora, Veo, Claude, Sonnet, GPT-class, open weights. We test so you don't have to.",
  },
  {
    Icon: GraduationCap,
    tag: "from zero",
    title: "Beginner to Architect Paths",
    body:
      "Roadmaps, level-ups, and 1:1 office-hour support whether you're a curious founder or scaling an AI-native org.",
  },
];

export function Benefits() {
  return (
    <section id="inside" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-glow/80">
            [ what's inside ]
         </span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Built for operators <br className="hidden md:block" />
            who <span className="text-gradient">actually ship</span>.
        </h2>
          <p className="mt-4 text-ink-50/70 md:text-lg">
            No courses. No fluff. A working community of founders, builders,
            and product people turning AI into actual revenue.
        </p>
      </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-cyan-glow/30 hover:shadow-glow-cyan"
            >
              {/* subtle grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 80% 0%, rgba(0,229,255,0.08) 0%, transparent 40%)",
                }}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-glow/10 ring-1 ring-cyan-glow/30 transition-all group-hover:bg-cyan-glow/20">
                    <b.Icon className="h-5 w-5 text-cyan-glow" strokeWidth={1.6} />
                </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-50/40">
                    {b.tag}
                </span>
              </div>
                <h3 className="mt-6 font-display text-xl font-semibold">
                  {b.title}
              </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-50/65">
                  {b.body}
              </p>
            </div>
          </article>
          ))}
      </div>
    </div>
  </section>
  );
}
