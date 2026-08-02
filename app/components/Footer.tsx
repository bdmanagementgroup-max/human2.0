import { Github, Twitter, MessageCircle, Lock } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-glow to-violet-glow shadow-glow-cyan">
                <span className="font-display text-sm font-bold text-ink-100">
                  h2
               </span>
             </div>
              <span className="font-display text-lg font-semibold">
                human<span className="text-cyan-glow">2.0</span>
             </span>
           </div>
            <p className="mt-3 max-w-xs text-sm text-ink-50/55">
              The augmented operator&apos;s community. Built by people who ship.
           </p>
         </div>

          <nav className="flex flex-col gap-6 md:flex-row md:gap-10">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-50/40">
                community
             </div>
              <ul className="space-y-1.5 text-sm text-ink-50/70">
                <li><a href="#" className="hover:text-cyan-glow">Login</a></li>
                <li><a href="#" className="hover:text-cyan-glow">Discord</a></li>
                <li><a href="#" className="hover:text-cyan-glow">Workshops</a></li>
             </ul>
           </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-50/40">
                resources
              </div>
              <ul className="space-y-1.5 text-sm text-ink-50/70">
                <li><a href="#" className="hover:text-cyan-glow">Templates</a></li>
                <li><a href="#" className="hover:text-cyan-glow">Changelog</a></li>
                <li><a href="#" className="hover:text-cyan-glow">Status</a></li>
             </ul>
           </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-50/40">
                legal
             </div>
              <ul className="space-y-1.5 text-sm text-ink-50/70">
                <li><a href="#" className="hover:text-cyan-glow">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-glow">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-glow">Refunds</a></li>
             </ul>
           </div>
         </nav>
       </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center">
          <p className="font-mono text-xs text-ink-50/40">
            © {year} human2.0 · all rights reserved
         </p>
          <div className="flex items-center gap-4 text-ink-50/40">
            <a href="#" aria-label="GitHub" className="transition-colors duration-200 hover:text-cyan-glow">
              <Github className="h-4 w-4" />
           </a>
            <a href="#" aria-label="Twitter" className="hover:text-cyan-glow">
              <Twitter className="h-4 w-4" />
           </a>
            <a href="#" aria-label="Discord" className="hover:text-cyan-glow">
              <MessageCircle className="h-4 w-4" />
           </a>
            <a href="#" aria-label="Secure" className="hover:text-cyan-glow">
              <Lock className="h-4 w-4" />
           </a>
         </div>
       </div>
     </div>
   </footer>
  );
}
