import { Sparkles, Radio } from "lucide-react";

const items = [
  "openclaw server setup",
  "AI video workflows",
  "agent frameworks",
  "private comms",
  "weekly workshops",
  "voice clones",
  "infra playbooks",
  "marketing stacks",
  "memory systems",
  "fine-tuning recipes",
];

export function Marquee() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 bg-ink-200/40 py-3 backdrop-blur">
      <div className="mask-fade-x flex">
        <div className="flex shrink-0 animate-marquee items-center gap-10 px-6 whitespace-nowrap">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-sm">
              <span className="font-mono text-xs text-cyan-glow/70">/</span>
              <span className="text-ink-50/80">{item}</span>
              <span className="text-cyan-glow/40">●</span>
           </span>
          ))}
       </div>
     </div>
   </div>
  );
}
