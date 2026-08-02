"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { SubscribeButton } from "@/app/components/SubscribeButton";

const links = [
  { href: "#inside", label: "Inside" },
  { href: "#topics", label: "Topics" },
  { href: "#manifesto", label: "Manifesto" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);

      // Active section detection
      const sections = links.map((l) => document.querySelector(l.href)).filter(Boolean) as HTMLElement[];
      let current = "";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120) {
          current = "#" + section.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      closeMobile();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [closeMobile]
  );

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-cyan-glow via-violet-glow to-cyan-glow transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.06] bg-ink-100/75 shadow-[0_1px_0_0_rgba(255,255,255,0.03)] backdrop-blur-xl supports-[backdrop-filter]:bg-ink-100/60"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-glow to-violet-glow shadow-glow-cyan transition-shadow duration-300 group-hover:shadow-[0_0_24px_rgba(0,229,255,0.5)]">
              <span className="font-display text-sm font-bold text-ink-100">
                h2
              </span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              human<span className="text-cyan-glow">2.0</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const isActive = activeSection === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => handleNavClick(e, l.href)}
                    className={`relative rounded-lg px-3.5 py-2 text-sm transition-all duration-200 hover:bg-white/[0.04] hover:text-ink-50 ${
                      isActive ? "text-cyan-glow" : "text-ink-50/70"
                    }`}
                  >
                    {l.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-cyan-glow" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-ink-50/70 transition-colors hover:bg-white/[0.04] hover:text-ink-50">
                  Sign in
                </button>
              </SignInButton>
              <SubscribeButton label="Get Started" size="default" />
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                    userButtonPopoverCard: "bg-ink-200/90 border border-cyan-glow/20 shadow-card",
                    userButtonPopoverActions: "text-cyan-glow hover:text-cyan-glow/80",
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-50/70 transition-colors hover:bg-white/[0.04] hover:text-ink-50 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-ink-100/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="rounded-xl px-6 py-3 font-display text-2xl font-medium text-ink-50/80 transition-all duration-200 hover:bg-white/[0.04] hover:text-ink-50"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xs px-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full rounded-xl px-6 py-3 font-display text-lg font-medium text-ink-50/80 transition-all duration-200 hover:bg-white/[0.04] hover:text-ink-50">
                  Sign in
                </button>
              </SignInButton>
              <SubscribeButton label="Get Started" size="lg" />
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                    userButtonPopoverCard: "bg-ink-200/90 border border-cyan-glow/20 shadow-card",
                    userButtonPopoverActions: "text-cyan-glow hover:text-cyan-glow/80",
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  );
}