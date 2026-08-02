"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string | null;
  subscriptionStatus: string | null;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const roleColors: Record<string, string> = {
  super_admin: "bg-violet-glow/20 text-violet-glow border border-violet-glow/30",
  admin: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  member: "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

const subStatusColors: Record<string, string> = {
  active: "bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/30",
  trialing: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  canceled: "bg-red-500/20 text-red-400 border border-red-500/30",
  past_due: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  incomplete: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  paused: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
};

interface UsersTableProps {
  initialUsers: User[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`);
      if (res.ok) {
        const data: UsersResponse = await res.json();
        setUsers(data.users);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 1 && users.length > 0 && !loading) return;
    fetchUsers(currentPage);
  }, [currentPage]);

  if (loading && users.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-zinc-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Subscription</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Joined</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {users.length === 0 ? (
            <tr>
              <td className="px-6 py-12 text-center text-zinc-500" colSpan={5}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">
                      {user.firstName || ""} {user.lastName || ""}
                    </p>
                    <p className="text-zinc-400 text-sm">{user.email}</p>
                    <p className="text-zinc-500 text-xs">{user.clerkId}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.member}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${subStatusColors[user.subscriptionStatus || ""] || "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}>
                    {user.subscriptionStatus || "None"}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 text-xs text-cyan-glow hover:text-cyan-glow/80 border border-cyan-glow/30 rounded hover:bg-cyan-glow/10 transition-colors">
                    Manage
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