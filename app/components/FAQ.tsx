"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What exactly do I get for $29/mo?",
    a: "Full access to the private community, weekly workshop replays, the template & playbook library, office-hour build sessions, and direct support. One subscription. Everything inside.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click from your account. You'll keep access until the end of your billing cycle — no retention games. Stay as long as it's useful.",
  },
  {
    q: "Do I need a technical background?",
    a: "No. About a third of members are non-technical founders learning to deploy AI tools. We have beginner tracks, advanced tracks, and clear roadmaps for both.",
  },
  {
    q: "Which AI tools and models do you cover?",
    a: "Frontier closed models (Claude, GPT, Gemini), open weights (Llama, Qwen, Mistral), image & video (Sora, Veo, Runway, Kling), voice (ElevenLabs, open TTS), agent frameworks, fine-tuning, RAG, self-hosted GPUs, and the production glue — prompts, eval, cost, privacy.",
  },
  {
    q: "How is this different from a course or YouTube?",
    a: "Courses are static. YouTube is fragmented. This is a live operator community — what people are shipping, what's broken, what's working. The content ships with the technology.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-glow/70">
            [ questions ]
        </span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            FAQ
       </h2>
     </div>

        <div className="mt-12 divide-y divide-white/5 rounded-2xl border border-white/5 bg-ink-200/30">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={f.q}
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="block w-full px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-ink-50">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-50/50 transition-transform ${
                      isOpen ? "rotate-180 text-cyan-glow" : ""
                    }`}
                 />
           </div>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "mt-3 grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pr-8 text-sm leading-relaxed text-ink-50/65">
                      {f.a}
                </p>
              </div>
             </div>
            </button>
            );
          })}
    </div>
  </div>
 </section>
  );
}
