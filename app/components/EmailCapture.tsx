"use client";

import { useState } from "react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      setStatus("success");
      setMessage("Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <section id="email-capture" className="relative py-12 md:py-16">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-glow/70">
            [ stay updated ]
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Get the latest updates
          </h2>
          <p className="mt-4 text-ink-50/70 md:text-lg">
            No spam. Just the latest workshops, tools, and insights from the community.
          </p>
        </div>

        <div className="mt-12">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className={`block w-full rounded-xl border border-white/5 bg-ink-200/40 px-6 py-4 text-sm text-ink-50 focus:outline-none focus:ring-2 focus:ring-cyan-glow focus:border-transparent transition-all duration-200 ${
                  status === "error" ? "border-cyan-glow/50" : ""
                }`}
                aria-invalid={status === "error" ? "true" : "false"}
                aria-describedby={status === "error" ? "email-error" : undefined}
                required
              />
              {status === "loading" && (
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cyan-glow animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0"/>
                    <path d="M12 6v6M12 12h6M12 18V12"></path>
                  </svg>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full rounded-xl font-semibold text-ink bg-gradient-to-b from-cyan-glow to-cyan-glow/80 px-6 py-4 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),0_8px_24px_-6px_rgba(0,229,255,0.4)] ring-1 ring-cyan-glow/15 transition-all hover:from-cyan-glow hover:to-cyan-glow/90 hover:shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),0_12px_32px_-6px_rgba(0,229,255,0.55)] active:translate-y-[1px] ${
                status === "loading"
                  ? "opacity-80 cursor-not-allowed"
                  : ""
              }`}
            >
              {status === "loading" ? "Subscribing..." : "Get Updates"}
            </button>
          </form>
        </div>

        {status !== "idle" && (
          <div className="mt-6 text-sm text-center">
            <p className={`
              ${status === "success" ? "text-cyan-glow" : "text-cyan-glow/50"}
              mt-2
            `}>
              {message}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}