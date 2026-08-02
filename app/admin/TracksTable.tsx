"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Track {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contentCount: number;
}

interface TracksResponse {
  tracks: Track[];
}

export function TracksTable() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tracks");
      if (res.ok) {
        const data: TracksResponse = await res.json();
        setTracks(data.tracks);
      }
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-zinc-400">Loading tracks...</p>
      </div>
    );
  }

  const iconColors: Record<string, string> = {
    cyan: "text-cyan-glow",
    violet: "text-violet-glow",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    pink: "text-pink-500",
    blue: "text-blue-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Track</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Key</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Icon</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Color</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Order</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Content</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {tracks.length === 0 ? (
            <tr>
              <td className="px-6 py-12 text-center text-zinc-500" colSpan={9}>
                No tracks found
              </td>
            </tr>
          ) : (
            tracks.map((track) => (
              <tr key={track.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{track.title}</p>
                </td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{track.key}</td>
                <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">
                  {track.description || "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-2xl ${iconColors[track.color] || "text-cyan-glow"}`}>
                    {track.icon || "★"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${iconColors[track.color] || "text-cyan-glow"}`}>
                    {track.color}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400">{track.order}</td>
                <td className="px-6 py-4 text-zinc-300">{track.contentCount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    track.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {track.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 text-xs text-cyan-glow hover:text-cyan-glow/80 border border-cyan-glow/30 rounded hover:bg-cyan-glow/10 transition-colors">
                    Edit
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