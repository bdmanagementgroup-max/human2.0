import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq, asc, and, count } from "drizzle-orm";
import {
  ChevronRight,
  Lock,
  CheckCircle,
  Sparkles,
  Server,
  Bot,
  Video,
  Mic,
  Megaphone,
  TrendingUp,
  Palette,
  Shield,
  Cpu,
  BookOpen,
  ClipboardList,
  FileText,
  Code2,
  Presentation,
  Headphones,
  BarChart2,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { getDb, tracks, content, userProgress, subscriptions } from "@/src/db";
import { getUserWithSubscription } from "@/src/lib/auth";
import { CancelSubscriptionButton } from "@/app/components/CancelSubscriptionButton";

const trackIcons: Record<string, LucideIcon> = {
  Server,
  Bot,
  Video,
  Mic,
  Megaphone,
  TrendingUp,
  Palette,
  Shield,
  Cpu,
};

const contentTypeIcons: Record<string, LucideIcon> = {
  guide: BookOpen,
  playbook: ClipboardList,
  template: FileText,
  video: Video,
  audio: Headphones,
  code: Code2,
  workshop: Presentation,
};

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient mb-4">Sign in to access your dashboard</h1>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-glow text-ink font-semibold rounded-lg hover:bg-cyan-glow/90 transition-colors"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role ?? "member";
  const isAdmin = role === "admin" || role === "super_admin";

  const userWithSub = await getUserWithSubscription();
  const subStatus = userWithSub?.subscription?.status;
  const hasSubscription = isAdmin || subStatus === "active" || subStatus === "trialing";

  const db = getDb();

  const [allTracks, allContent] = await Promise.all([
    db.select().from(tracks).where(eq(tracks.isActive, true)).orderBy(asc(tracks.order)),
    db.select().from(content).where(eq(content.isPublished, true)).orderBy(asc(content.title)),
  ]);

  const contentByTrack = new Map<string, typeof allContent>();
  for (const item of allContent) {
    const list = contentByTrack.get(item.trackId) ?? [];
    list.push(item);
    contentByTrack.set(item.trackId, list);
  }

  // Fetch user progress for all content
  let userProgressMap = new Map<string, { completed: boolean; completedAt: Date | null }>();
  let completedCount = 0;
  if (userWithSub) {
    const progress = await db
      .select({
        contentId: userProgress.contentId,
        completed: userProgress.completed,
        completedAt: userProgress.completedAt,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userWithSub.user.id));

    for (const p of progress) {
      userProgressMap.set(p.contentId, { completed: p.completed, completedAt: p.completedAt });
      if (p.completed) completedCount++;
    }
  }

  const totalContent = allContent.length;
  const progressPercent = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0;

  // Calculate per-track progress
  const trackProgress = new Map<string, { completed: number; total: number; percent: number }>();
  for (const track of allTracks) {
    const items = contentByTrack.get(track.id) ?? [];
    let trackCompleted = 0;
    for (const item of items) {
      const prog = userProgressMap.get(item.id);
      if (prog?.completed) trackCompleted++;
    }
    trackProgress.set(track.id, {
      completed: trackCompleted,
      total: items.length,
      percent: items.length > 0 ? Math.round((trackCompleted / items.length) * 100) : 0,
    });
  }

  return (
    <div className="min-h-screen bg-ink pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Welcome back, {userWithSub?.user.firstName || "Operator"}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Your command center for the human2.0 operator community. Access tracks, monitor progress, and connect with fellow operators.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                isAdmin
                  ? "bg-violet-glow/20 text-violet-glow border border-violet-glow/30"
                  : hasSubscription
                  ? "bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/30"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              {isAdmin ? "Super Admin" : hasSubscription ? "Member" : "Free Tier"}
            </span>
          </div>
          {!isAdmin && hasSubscription && (
            <div className="mt-4">
              <CancelSubscriptionButton />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-ink/80 border border-cyan-glow/20 shadow-card rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-glow/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-cyan-glow" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Tracks Available</p>
                <p className="text-2xl font-bold text-white">{allTracks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-ink/80 border border-cyan-glow/20 shadow-card rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-glow/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-violet-glow" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Overall Progress</p>
                <p className="text-2xl font-bold text-white">{progressPercent}%</p>
              </div>
            </div>
          </div>
          <div className="bg-ink/80 border border-cyan-glow/20 shadow-card rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">{hasSubscription ? "Unlocked" : "Locked"}</p>
                <p className="text-2xl font-bold text-white">{hasSubscription ? "All Content" : "Upgrade"}</p>
              </div>
            </div>
          </div>
          <div className="bg-ink/80 border border-cyan-glow/20 shadow-card rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <BarChart2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Completed Items</p>
                <p className="text-2xl font-bold text-white">{completedCount} / {totalContent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details (for members) */}
        {!isAdmin && hasSubscription && userWithSub?.subscription && (
          <div className="bg-ink/80 border border-cyan-glow/20 shadow-card rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-glow/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-cyan-glow" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Active Subscription</h3>
                  <p className="text-sm text-zinc-400">
                    Status:{" "}
                    <span className="capitalize">{subStatus?.replace("_", " ")}</span>
                    {userWithSub.subscription.currentPeriodEnd && (
                      <>
                        {" | Renews: "}
                        <span className="text-cyan-glow">
                          {new Date(userWithSub.subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <CancelSubscriptionButton />
            </div>
          </div>
        )}

        {/* Track Grid with Progress */}
        <div className="space-y-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-glow" />
            Learning Tracks
          </h2>
          {allTracks.map((track) => {
            const TrackIcon = trackIcons[track.icon ?? ""] ?? Sparkles;
            const items = contentByTrack.get(track.id) ?? [];
            const tProgress = trackProgress.get(track.id) ?? { completed: 0, total: 0, percent: 0 };

            return (
              <div key={track.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-cyan-glow/10">
                      <TrackIcon className="w-5 h-5 text-cyan-glow" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{track.title}</h3>
                      <p className="text-sm text-zinc-400">{track.description}</p>
                    </div>
                  </div>
                  {/* Track Progress Badge */}
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-glow transition-all duration-500"
                        style={{ width: `${tProgress.percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-cyan-glow">
                      {tProgress.percent}%
                    </span>
                    <span className="text-sm text-zinc-500">
                      {tProgress.completed}/{tProgress.total}
                    </span>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-sm text-zinc-600 pl-12">No published content yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => {
                      const ItemIcon = contentTypeIcons[item.type] ?? FileText;
                      const locked = item.isPremium && !hasSubscription;
                      const isCompleted = userProgressMap.get(item.id)?.completed ?? false;
                      const progressPercent = isCompleted ? 100 : 0;

                      return (
                        <Link
                          key={item.id}
                          href={`/content/${item.slug}`}
                          className={`group bg-ink/80 border rounded-xl p-5 transition-all duration-300 relative overflow-hidden ${
                            locked
                              ? "border-zinc-800 opacity-60"
                              : isCompleted
                              ? "border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-glow-emerald"
                              : "border-cyan-glow/20 hover:border-cyan-glow/50 hover:shadow-glow-cyan"
                          }`}
                        >
                          {/* Progress indicator bar at top */}
                          {!locked && (
                            <div
                              className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 overflow-hidden"
                            >
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isCompleted ? "bg-emerald-500" : "bg-cyan-glow"
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}

                          <div className="flex items-start gap-3 relative z-10">
                            <div className={`p-2 rounded-lg shrink-0 ${locked ? "bg-zinc-800" : isCompleted ? "bg-emerald-500/10" : "bg-cyan-glow/10"}`}>
                              <ItemIcon className={`w-5 h-5 ${locked ? "text-zinc-500" : isCompleted ? "text-emerald-500" : "text-cyan-glow"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-medium ${locked ? "text-zinc-500" : isCompleted ? "text-emerald-400" : "text-white"}`}>
                                  {item.title}
                                </h4>
                                {isCompleted && !locked && (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <span
                                  className={`px-2 py-0.5 rounded capitalize ${
                                    locked ? "bg-zinc-800 text-zinc-500" : isCompleted ? "bg-emerald-500/20 text-emerald-500" : "bg-cyan-glow/20 text-cyan-glow"
                                  }`}
                                >
                                  {item.type}
                                </span>
                                {item.durationMinutes && (
                                  <span className="text-zinc-500">{item.durationMinutes} min</span>
                                )}
                                {locked && <Lock className="w-3.5 h-3.5 text-zinc-600 ml-auto" />}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <div className="pt-8 border-t border-zinc-800">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-glow/10 text-violet-glow border border-violet-glow/30 font-semibold rounded-lg hover:bg-violet-glow/20 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Admin Dashboard
            </Link>
          </div>
        )}

        {!hasSubscription && !isAdmin && (
          <div className="pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 mb-4">Unlock all tracks and join the operator community</p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-glow text-ink font-bold rounded-lg hover:bg-cyan-glow/90 transition-colors text-lg"
            >
              Get Full Access <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}