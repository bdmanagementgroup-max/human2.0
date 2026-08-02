"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CONTENT_TYPES = ["workshop", "template", "playbook", "guide", "video", "audio", "code"] as const;

interface TrackOption {
  id: string;
  title: string;
}

interface ContentFormValues {
  id?: string;
  title: string;
  slug: string;
  trackId: string;
  type: string;
  description: string;
  contentBody: string;
  videoUrl: string;
  durationMinutes: string;
  isPublished: boolean;
  isPremium: boolean;
}

export function ContentForm({
  tracks,
  initialValues,
}: {
  tracks: TrackOption[];
  initialValues?: ContentFormValues;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);

  const [values, setValues] = useState<ContentFormValues>(
    initialValues ?? {
      title: "",
      slug: "",
      trackId: tracks[0]?.id ?? "",
      type: "guide",
      description: "",
      contentBody: "",
      videoUrl: "",
      durationMinutes: "",
      isPublished: false,
      isPremium: true,
    }
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (field: keyof ContentFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const res = await fetch(
        isEditing ? `/api/admin/content/${initialValues!.id}` : "/api/admin/content",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
        <input
          type="text"
          required
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Slug</label>
        <input
          type="text"
          required
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only"
          value={values.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Track</label>
          <select
            required
            value={values.trackId}
            onChange={(e) => handleChange("trackId", e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
          >
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Type</label>
          <select
            value={values.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Body (HTML)</label>
        <p className="text-xs text-zinc-500 mb-2">
          Rendered as raw HTML on the content page — use tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;code&gt;, not markdown syntax.
        </p>
        <textarea
          rows={16}
          value={values.contentBody}
          onChange={(e) => handleChange("contentBody", e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-glow"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Video URL</label>
          <input
            type="url"
            value={values.videoUrl}
            onChange={(e) => handleChange("videoUrl", e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Duration (minutes)</label>
          <input
            type="number"
            min="0"
            value={values.durationMinutes}
            onChange={(e) => handleChange("durationMinutes", e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-glow"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(e) => handleChange("isPublished", e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-cyan-glow focus:ring-cyan-glow"
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={values.isPremium}
            onChange={(e) => handleChange("isPremium", e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-cyan-glow focus:ring-cyan-glow"
          />
          Premium (requires subscription)
        </label>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{message}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-6 py-2 bg-cyan-glow text-ink font-semibold rounded-lg hover:bg-cyan-glow/90 transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving..." : isEditing ? "Save Changes" : "Create Content"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-6 py-2 text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
