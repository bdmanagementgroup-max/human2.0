"use client";

import { Users, CreditCard, FileText, Layers, BarChart2, TrendingUp, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  userCount: number;
  activeSubCount: number;
  contentCount: number;
  trackCount: number;
}

export function StatsCards({ userCount, activeSubCount, contentCount, trackCount }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: userCount.toLocaleString(),
      icon: Users,
      color: "cyan",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Subscriptions",
      value: activeSubCount.toLocaleString(),
      icon: CreditCard,
      color: "violet",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Content Items",
      value: contentCount.toLocaleString(),
      icon: FileText,
      color: "amber",
      change: "+3",
      trend: "up",
    },
    {
      title: "Learning Tracks",
      value: trackCount.toLocaleString(),
      icon: Layers,
      color: "emerald",
      change: "—",
      trend: "neutral",
    },
  ];

  const colorStyles: Record<string, string> = {
    cyan: "bg-cyan-glow/10 border-cyan-glow/20 text-cyan-glow",
    violet: "bg-violet-glow/10 border-violet-glow/20 text-violet-glow",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-ink/80 border shadow-card rounded-xl p-6 ${colorStyles[stat.color] || colorStyles.cyan}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                <p className={`text-xs font-medium mt-2 ${stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-500" : "text-zinc-500"}`}>
                  {stat.change} {stat.trend === "up" && "vs last month"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <Icon className="w-8 h-8" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}