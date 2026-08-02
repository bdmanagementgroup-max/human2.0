"use client";

import { useState } from "react";
import { StatsCards } from "./StatsCards";
import { UsersTable } from "./UsersTable";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { ContentTable } from "./ContentTable";
import { TracksTable } from "./TracksTable";

interface AdminDashboardClientProps {
  initialStats: {
    userCount: number;
    activeSubCount: number;
    contentCount: number;
    trackCount: number;
  };
  initialUsers: Array<{
    id: string;
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string | null;
    subscriptionStatus: string | null;
  }>;
  initialContent: Array<{
    id: string;
    title: string;
    slug: string;
    trackId: string;
    type: string;
    isPublished: boolean;
    isPremium: boolean;
    createdAt: string | null;
    trackTitle: string | null;
  }>;
}

export function AdminDashboardClient({
  initialStats,
  initialUsers,
  initialContent,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "subscriptions" | "content" | "tracks">("users");

  return (
    <div className="min-h-screen bg-ink pt-20 pb-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage users, content, and monitor the platform</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/content/new"
              className="px-4 py-2 bg-cyan-glow text-ink font-semibold rounded-lg hover:bg-cyan-glow/90 transition-colors"
            >
              + Add Content
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-600 transition-colors"
            >
              View as Member
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsCards
          userCount={initialStats.userCount}
          activeSubCount={initialStats.activeSubCount}
          contentCount={initialStats.contentCount}
          trackCount={initialStats.trackCount}
        />

        {/* Tabs Navigation */}
        <div className="space-y-6">
          <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "users"
                  ? "bg-cyan-glow text-ink"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "subscriptions"
                  ? "bg-cyan-glow text-ink"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "content"
                  ? "bg-cyan-glow text-ink"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("tracks")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "tracks"
                  ? "bg-cyan-glow text-ink"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Tracks
            </button>
          </div>

          {/* Tab Panels */}
          <div className="bg-ink/80 border border-cyan-glow/20 shadow-card rounded-xl overflow-hidden">
            {activeTab === "users" && <UsersTable initialUsers={initialUsers} />}
            {activeTab === "subscriptions" && <SubscriptionsTable />}
            {activeTab === "content" && <ContentTable initialContent={initialContent} />}
            {activeTab === "tracks" && <TracksTable />}
          </div>
        </div>
      </div>
    </div>
  );
}