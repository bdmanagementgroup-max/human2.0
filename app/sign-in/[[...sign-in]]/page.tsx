"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto max-w-md",
            card: "bg-ink/80 border border-cyan-glow/20 shadow-card",
            formButtonPrimary: "bg-cyan-glow text-ink hover:bg-cyan-glow/90",
            formButtonPrimaryHover: "bg-cyan-glow/90",
            formFieldInput: "bg-ink/50 border-cyan-glow/30 focus:border-cyan-glow focus:ring-cyan-glow/20",
            formFieldLabel: "text-zinc-300",
            formFieldError: "text-red-400",
            headerTitle: "text-white text-gradient",
            headerSubtitle: "text-zinc-400",
            footerActionLink: "text-cyan-glow hover:text-cyan-glow/80",
            socialButtonsBlockButton: "border-cyan-glow/30 hover:border-cyan-glow/50 hover:bg-ink/50",
            socialButtonsBlockButtonIcon: "text-zinc-300",
          },
        }}
      />
    </div>
  );
}