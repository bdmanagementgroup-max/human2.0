"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useClerkAuth } from "@/src/hooks/useAuth";
import {
  ChevronLeft,
  Play,
  BookOpen,
  FileText,
  Video,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ClipboardList,
  Code2,
  Presentation,
  Headphones,
  Clock,
  Signal,
  type LucideIcon,
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  type: string;
  trackId: string;
  trackTitle: string;
  isPublished: boolean;
  requiresSubscription: boolean;
  videoUrl: string | null;
  durationMinutes: number | null;
  difficulty?: string | null;
}

interface ProgressState {
  completed: boolean;
  completedAt: string | null;
}

const typeStyles: Record<
  string,
  { icon: LucideIcon; accent: string; badge: string; glow: string }
> = {
  guide: {
    icon: BookOpen,
    accent: "from-cyan-glow to-cyan-glow/40",
    badge: "bg-cyan-glow/15 text-cyan-glow border-cyan-glow/30",
    glow: "shadow-glow-cyan",
  },
  playbook: {
    icon: ClipboardList,
    accent: "from-emerald-glow to-emerald-glow/40",
    badge: "bg-emerald-glow/15 text-emerald-glow border-emerald-glow/30",
    glow: "shadow-glow-emerald",
  },
  template: {
    icon: FileText,
    accent: "from-blue-400 to-blue-400/40",
    badge: "bg-blue-400/15 text-blue-400 border-blue-400/30",
    glow: "shadow-glow-cyan",
  },
  code: {
    icon: Code2,
    accent: "from-amber-500 to-amber-500/40",
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    glow: "shadow-glow-amber",
  },
  workshop: {
    icon: Presentation,
    accent: "from-violet-glow to-violet-glow/40",
    badge: "bg-violet-glow/15 text-violet-glow border-violet-glow/30",
    glow: "shadow-glow-violet",
  },
  audio: {
    icon: Headphones,
    accent: "from-pink-400 to-pink-400/40",
    badge: "bg-pink-400/15 text-pink-400 border-pink-400/30",
    glow: "shadow-glow-violet",
  },
  video: {
    icon: Video,
    accent: "from-pink-400 to-pink-400/40",
    badge: "bg-pink-400/15 text-pink-400 border-pink-400/30",
    glow: "shadow-glow-violet",
  },
};

const difficultyStyles: Record<string, string> = {
  beginner: "bg-emerald-glow/15 text-emerald-glow border-emerald-glow/30",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function ContentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isLoaded, isSignedIn, user, isAdmin } = useClerkAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/content/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("NOT_FOUND");
        } else {
          setError("FETCH_FAILED");
        }
        return;
      }
      const data = await res.json();
      setContent(data);

      // Check if content is published (or user is admin)
      if (!data.isPublished && !isAdmin) {
        setError("NOT_PUBLISHED");
        return;
      }

      // Determine access locally first
      let hasContentAccess = false;
      if (!data.requiresSubscription || isAdmin) {
        // Free content or admin
        hasContentAccess = true;
      } else if (data.requiresSubscription && isSignedIn) {
        // Premium content - check subscription
        setCheckingAccess(true);
        try {
          const subRes = await fetch("/api/user/subscription");
          if (subRes.ok) {
            const subData = await subRes.json();
            hasContentAccess = subData.hasActiveSubscription;
          }
        } catch {
          hasContentAccess = false;
        } finally {
          setCheckingAccess(false);
        }
      }
      // If not signed in and requires subscription, hasContentAccess stays false

      setHasAccess(hasContentAccess);

      // Fetch progress if user is signed in and has access
      if (isSignedIn && hasContentAccess) {
        try {
          const progRes = await fetch("/api/user/progress");
          if (progRes.ok) {
            const progData = await progRes.json();
            const itemProgress = progData.progress?.find((p: any) => p.contentId === data.id);
            if (itemProgress) {
              setProgress({
                completed: itemProgress.completed,
                completedAt: itemProgress.completedAt,
              });
            }
          }
        } catch {
          // Ignore progress fetch errors
        }
      }
    } catch (err) {
      console.error("Failed to fetch content:", err);
      setError("FETCH_FAILED");
    } finally {
      setLoading(false);
    }
  }, [slug, isLoaded, isSignedIn, isAdmin]);

  useEffect(() => {
    if (isLoaded) {
      fetchContent();
    }
  }, [isLoaded, fetchContent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error === "NOT_FOUND") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-zinc-400">The content you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (error === "NOT_PUBLISHED") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Available</h1>
          <p className="text-zinc-400">This content is not published yet.</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-zinc-400">Failed to load content.</p>
        </div>
      </div>
    );
  }

  const style = typeStyles[content.type] ?? typeStyles.guide;
  const TypeIcon = style.icon;
  const difficultyClass =
    content.difficulty && difficultyStyles[content.difficulty]
      ? difficultyStyles[content.difficulty]
      : null;

  const handleMarkComplete = async () => {
    if (!content || savingProgress || progress?.completed) return;

    setSavingProgress(true);
    try {
      const res = await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: content.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.alreadyCompleted) {
          setProgress({ completed: true, completedAt: new Date().toISOString() });
        } else {
          setProgress({ completed: true, completedAt: new Date().toISOString() });
        }
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to save progress");
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
      alert(err instanceof Error ? err.message : "Failed to save progress");
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink relative">
      {/* Ambient background glow tied to content type */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-br ${style.accent} opacity-[0.07] blur-[120px]`}
        />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-ink/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-zinc-400 hover:text-cyan-glow transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </a>
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  content.requiresSubscription
                    ? "bg-violet-glow/15 text-violet-glow border-violet-glow/30"
                    : "bg-emerald-glow/15 text-emerald-glow border-emerald-glow/30"
                }`}
              >
                {content.requiresSubscription ? "Member Only" : "Free"}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${style.badge}`}>
                {content.type}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Track Breadcrumb */}
          <div className="mb-5">
            <a
              href={`/dashboard?track=${content.trackId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-cyan-glow transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {content.trackTitle}
            </a>
          </div>

          {/* Title & Meta */}
          <header className="mb-10">
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`shrink-0 p-3 rounded-xl border ${style.badge} ${style.glow}`}
              >
                <TypeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                    {content.title}
                  </h1>
                  {progress?.completed && (
                    <span title="Completed">
                      <CheckCircle className="w-6 h-6 text-emerald-glow shrink-0" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {content.description && (
              <p className="text-lg text-zinc-400 leading-relaxed mb-5">{content.description}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap text-sm">
              {content.durationMinutes && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  {content.durationMinutes} min
                </span>
              )}
              {content.difficulty && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border capitalize font-medium ${
                    difficultyClass ?? "bg-white/5 border-white/10 text-zinc-400"
                  }`}
                >
                  <Signal className="w-3.5 h-3.5" />
                  {content.difficulty}
                </span>
              )}
            </div>
          </header>

          {/* Access Gate */}
          {!hasAccess && content.requiresSubscription && !isAdmin && !checkingAccess && (
            <div className="relative overflow-hidden bg-gradient-to-b from-violet-glow/10 to-transparent border border-violet-glow/30 shadow-glow-violet rounded-2xl p-8 md:p-12 text-center mb-8">
              <Lock className="w-14 h-14 mx-auto text-violet-glow mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Member Content</h2>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                This content is exclusive to human2.0 members. Subscribe to unlock full access to all tracks, guides, and videos.
              </p>
              <a
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-3 bg-violet-glow text-ink font-bold rounded-lg hover:bg-violet-glow/90 hover:shadow-glow-violet transition-all"
              >
                <Play className="w-5 h-5" />
                Subscribe Now
              </a>
            </div>
          )}

          {/* Loading access check */}
          {checkingAccess && content.requiresSubscription && !isAdmin && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 text-center mb-8">
              <div className="w-12 h-12 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">Checking subscription...</p>
            </div>
          )}

          {/* Content Body */}
          {hasAccess || !content.requiresSubscription || isAdmin ? (
            <article
              className={`prose prose-invert prose-lg max-w-none bg-ink/60 border border-white/8 ${style.glow} rounded-2xl p-6 md:p-10 backdrop-blur-sm`}
            >
              {content.content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <div className="text-center py-12 not-prose">
                  <TypeIcon className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                  <p className="text-zinc-500">Content body not available.</p>
                </div>
              )}

              {content.videoUrl && (
                <div className="mt-8 aspect-video bg-zinc-900 rounded-lg overflow-hidden relative not-prose">
                  <iframe
                    src={content.videoUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </article>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 md:p-12 text-center">
              <Lock className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-400 mb-2">Locked Content</h3>
              <p className="text-zinc-500">Subscribe to human2.0 to unlock this content.</p>
            </div>
          )}

          {/* Progress Tracking */}
          {(hasAccess || !content.requiresSubscription || isAdmin) && isSignedIn && (
            <div className="mt-8 bg-ink/60 border border-white/8 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${style.badge}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-white">
                    {progress?.completed ? "Completed" : "Mark as Complete"}
                  </span>
                  {progress?.completed && (
                    <span className="px-2 py-0.5 text-xs bg-emerald-glow/20 text-emerald-glow rounded-full">
                      {progress.completedAt ? new Date(progress.completedAt).toLocaleDateString() : "Completed"}
                    </span>
                  )}
                </div>
                {progress?.completed ? (
                  <div className="flex items-center gap-2 text-emerald-glow">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                ) : (
                  <button
                    className="px-6 py-2 bg-cyan-glow text-ink font-bold rounded-lg hover:bg-cyan-glow/90 hover:shadow-glow-cyan transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleMarkComplete}
                    disabled={savingProgress}
                  >
                    {savingProgress ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Mark Complete"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sign in prompt for progress tracking */}
          {(hasAccess || !content.requiresSubscription || isAdmin) && !isSignedIn && (
            <div className="mt-8 bg-ink/60 border border-white/8 rounded-xl p-6 text-center backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-zinc-400 mb-1">Track Your Progress</h3>
              <p className="text-zinc-500 mb-4">Sign in to mark content as complete and track your learning journey.</p>
              <a
                href="/sign-in"
                className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-glow text-ink font-bold rounded-lg hover:bg-cyan-glow/90 transition-colors"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
