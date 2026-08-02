"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Subscription {
  id: string;
  userId: string;
  paypalPayerId: string | null;
  paypalSubscriptionId: string | null;
  paypalPlanId: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  createdAt: string;
  updatedAt: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userClerkId: string | null;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusColors: Record<string, string> = {
  active: "bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/30",
  trialing: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  canceled: "bg-red-500/20 text-red-400 border border-red-500/30",
  past_due: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  incomplete: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  paused: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
};

export function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSubscriptions = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions?page=${page}&limit=20`);
      if (res.ok) {
        const data: SubscriptionsResponse = await res.json();
        setSubscriptions(data.subscriptions);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(currentPage);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-zinc-400">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Plan ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Subscription ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Billing Period</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {subscriptions.length === 0 ? (
            <tr>
              <td className="px-6 py-12 text-center text-zinc-500" colSpan={7}>
                No subscriptions found
              </td>
            </tr>
          ) : (
            subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">
                      {sub.userFirstName || ""} {sub.userLastName || ""}
                    </p>
                    <p className="text-zinc-400 text-sm">{sub.userEmail}</p>
                    <p className="text-zinc-500 text-xs">{sub.userClerkId}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-300 font-mono text-sm">
                  {sub.paypalPlanId || "—"}
                </td>
                <td className="px-6 py-4 text-zinc-300 font-mono text-sm">
                  {sub.paypalSubscriptionId || "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sub.status] || "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                    <>
                      {new Date(sub.currentPeriodStart).toLocaleDateString()} -{" "}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 text-xs text-cyan-glow hover:text-cyan-glow/80 border border-cyan-glow/30 rounded hover:bg-cyan-glow/10 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}