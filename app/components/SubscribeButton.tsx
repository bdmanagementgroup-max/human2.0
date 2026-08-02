"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Loader2, Lock, Check } from "lucide-react";

interface SubscribeButtonProps {
  planId?: string;
  label?: string;
  size?: "default" | "lg";
}

export function SubscribeButton({
  planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
  label = "Subscribe",
  size = "default",
}: SubscribeButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { isSignedIn } = useUser();
  const { openSignUp } = useClerk();

  const handleClick = async () => {
    if (!isSignedIn) {
      openSignUp({ redirectUrl: "/dashboard" });
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to PayPal for subscription approval
      window.location.href = data.url;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const padding = size === "lg" ? "px-9 py-5 text-lg" : "px-6 py-3.5 text-base";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-xl
        bg-gradient-to-b from-cyan-glow to-cyan-glow/80 font-semibold text-ink
        shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),0_8px_24px_-6px_rgba(0,229,255,0.4)]
        ring-1 ring-cyan-glow/15 transition-all
        hover:from-cyan-glow hover:to-cyan-glow/90
        hover:shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),0_12px_32px_-6px_rgba(0,229,255,0.55)]
        active:translate-y-[1px]
        ${status === "loading" ? "opacity-80 cursor-not-allowed" : ""}
        ${padding}`}
    >
      <span className="flex items-center gap-2">
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : status === "success" ? (
          <Check className="h-5 w-5" />
        ) : (
          <Lock className="h-5 w-5" />
        )}
        <span className="-mx-1 h-5 w-px bg-ink/20" />
        <span className="text-ink/90">{status === "success" ? "Redirecting..." : label}</span>
      </span>
      <span className="ml-2 rounded-md bg-ink px-2 py-1 font-mono text-xs font-semibold text-cyan-glow">
        $29/mo
      </span>
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden
      />
      {status === "error" && (
        <div className="absolute bottom-full left-0 right-0 mb-2 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg">
          {message}
        </div>
      )}
    </button>
  );
}