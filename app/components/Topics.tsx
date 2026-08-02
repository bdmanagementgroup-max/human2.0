import {
  Server,
  Video,
  Bot,
  MessageCircle,
  Mic,
  ShieldCheck,
  Code2,
  PenTool,
  Globe,
  TrendingUp,
} from "lucide-react";

const topics = [
  {
    Icon: Server,
    label: "Self-Hosted AI Servers",
    code: "/01",
    body: "openclaw-style stacks, GPU routing, cost engineering at scale.",
  },
  {
    Icon: Video,
    label: "AI Video Generation",
    code: "/02",
    body: "Sora, Veo, Runway, Kling — production workflows and promptcraft.",
  },
  {
    Icon: Bot,
    label: "Agent Frameworks",
    code: "/03",
    body: "LangGraph, AutoGen, custom tool-use, memory architectures.",
  },
  {
    Icon: MessageCircle,
    label: "Conversational AI",
    code: "/04",
    body: "Voice agents, chat copilots, customer-facing deploys.",
  },
  {
    Icon: Mic,
    label: "Voice Cloning & TTS",
    code: "/05",
    body: "ElevenLabs, open-weights clones, real-time pipelines.",
  },
  {
    Icon: Globe,
    label: "Marketing & SEO",
    code: "/06",
    body: "AI for content engines, programmatic SEO, conversion loops.",
  },
  {
    Icon: PenTool,
    label: "Content & Creative",
    code: "/07",
    body: "Image models, brand systems, art-direction at scale.",
  },
  {
    Icon: TrendingUp,
    label: "Sales & Ops Automation",
    code: "/08",
    body: "Outbound, enrichment, proposal gen, internal copilots.",
  },
  {
    Icon: ShieldCheck,
    label: "Privacy, Security, Cost",
    code: "/09",
    body: "PII handling, prompt-injection defense, FinOps for inference.",
  },
  {
    Icon: Code2,
    label: "Fine-Tuning & Eval",
    code: "/10",
    body: "Open-weights LoRA, RAG systems, evals that actually measure things.",
  },
];

export function Topics() {
  return (
    <section id="topics" className="relative py-12 md:py-16">
      {/* divider line */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 pt-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-violet-glow/80">
              [ topics ]
          </span>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Ten tracks. <br />
              <span className="text-glow-violet text-violet-glow">All of it</span>
        </h2>
        </div>
          <p className="max-w-md text-ink-50/65 md:text-right">
            Every angle of AI-for-business — from infrastructure to
            production. Pick what you need this month. We&apos;ve got you covered.
       </p>
      </div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <div
              key={t.label}
              className="group relative flex items-start gap-4 overflow-hidden rounded-xl border border-white/5 bg-ink-200/40 p-5 transition-all duration-300 hover:border-violet-glow/30 hover:bg-ink-300 hover:-translate-y-[2px]"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-glow/20 to-cyan-glow/10 ring-1 ring-white/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <t.Icon className="h-5 w-5 text-ink-50" strokeWidth={1.6} />
            </div>
                <div className="absolute inset-x-0 bottom-0 bg-violet-glow/30 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-medium text-ink-50">{t.label}</h3>
                  <span className="font-mono text-[10px] text-ink-50/40">
                    {t.code}
               </span>
             </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-50/55">
                  {t.body}
                </p>
              </div>
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-glow/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </div>
          ))}
   </div>
     </div>
 </section>
  );
}
