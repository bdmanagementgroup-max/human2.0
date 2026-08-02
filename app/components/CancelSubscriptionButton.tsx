"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCancel = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Cancellation failed");
      }

      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-zinc-500 hover:text-red-400 transition-colors underline underline-offset-4"
      >
        Cancel subscription
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-zinc-400">
        Cancel your subscription? You&apos;ll keep access until the end of the current billing period.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === "loading"}
          className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
          Yes, cancel
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={status === "loading"}
          className="px-4 py-2 text-sm font-medium text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
        >
          Keep subscription
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-400">{message}</p>
      )}
    </div>
  );
}
