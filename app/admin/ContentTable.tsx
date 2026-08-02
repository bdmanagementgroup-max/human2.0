"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DeleteContentButton } from "./content/DeleteContentButton";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  trackId: string;
  type: string;
  isPublished: boolean;
  isPremium?: boolean;
  createdAt: string | null;
  trackTitle: string | null;
}

interface TrackOption {
  id: string;
  title: string;
  contentCount: number;
}

interface ContentResponse {
  content: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const typeColors: Record<string, string> = {
  workshop: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  template: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  playbook: "bg-green-500/20 text-green-400 border border-green-500/30",
  guide: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  video: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
  audio: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  code: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

const CONTENT_TYPES = ["guide", "playbook", "template", "code", "workshop", "audio", "video"];

interface ContentTableProps {
  initialContent: ContentItem[];
}

export function ContentTable({ initialContent }: ContentTableProps) {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [tracks, setTracks] = useState<TrackOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(initialContent.length);

  const [trackFilter, setTrackFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/tracks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tracks) setTracks(data.tracks);
      })
      .catch(() => {});
  }, []);

  const fetchContent = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (trackFilter) params.set("trackId", trackFilter);
        if (typeFilter) params.set("type", typeFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/content?${params.toString()}`);
        if (res.ok) {
          const data: ContentResponse = await res.json();
          setContent(data.content);
          setCurrentPage(data.pagination.page);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    },
    [trackFilter, typeFilter, search]
  );

  // Re-fetch whenever filters change (reset to page 1)
  useEffect(() => {
    fetchContent(1);
  }, [trackFilter, typeFilter, search, fetchContent]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center gap-3">
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
        >
          <option value="">All Categories</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title} ({track.contentCount})
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
        >
          <option value="">All Types</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
            />
          </div>
        </form>

        {(trackFilter || typeFilter || search) && (
          <button
            onClick={() => {
              setTrackFilter("");
              setTypeFilter("");
              setSearchInput("");
              setSearch("");
            }}
            className="text-xs text-zinc-400 hover:text-white underline"
          >
            Clear filters
          </button>
        )}

        <span className="text-xs text-zinc-500 ml-auto">{total} item{total !== 1 ? "s" : ""}</span>
      </div>

      {loading && content.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-zinc-400">Loading content...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {content.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-zinc-500" colSpan={7}>
                    No content found
                  </td>
                </tr>
              ) : (
                content.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium truncate max-w-xs">{item.title}</p>
                      <p className="text-zinc-500 text-xs">{item.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{item.trackTitle || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type] || "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isPremium
                          ? "bg-violet-glow/20 text-violet-glow border border-violet-glow/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {item.isPremium ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isPublished
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/content/${item.id}/edit`}
                          className="px-3 py-1 text-xs text-cyan-glow hover:text-cyan-glow/80 border border-cyan-glow/30 rounded hover:bg-cyan-glow/10 transition-colors"
                        >
                          Edit
                        </a>
                        <DeleteContentButton id={item.id} title={item.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => fetchContent(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => fetchContent(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
