import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { Bell, Plus, Trash2, X, Send } from "lucide-react";
import {
  getNotifications,
  addNotification,
  deleteNotification,
} from "@/firebase/firestore";
import type { Notice } from "@/firebase/firestore";

const NotificationsPage = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === "admin";

  const [notices,  setNotices]  = useState<Notice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotifications();
      setNotices(data);
      // Mark latest as seen
      if (data[0]) localStorage.setItem("seen_notice", data[0].id);
    } catch {
      setError("Failed to load notifications. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    try {
      await addNotification(title.trim(), content.trim(), user?.name || "Admin");
      setTitle("");
      setContent("");
      setShowForm(false);
      await load();
    } catch {
      setError("Failed to post notification.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteNotification(id);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch {
      setError("Failed to delete notification.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-2xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                Notifications
              </h1>
              <p className="text-sm" style={muted}>{notices.length} notice{notices.length !== 1 ? "s" : ""}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95"
                style={{
                  fontFamily: "Outfit, sans-serif",
                  background: showForm ? "rgba(239,68,68,0.12)" : "rgba(139,92,246,0.15)",
                  color: showForm ? "hsl(0 72% 50%)" : "hsl(265 80% 50%)",
                  border: `1px solid ${showForm ? "rgba(239,68,68,0.25)" : "rgba(139,92,246,0.25)"}`,
                }}
              >
                {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Post Notice</>}
              </button>
            )}
          </div>

          {/* Post form (admin only) */}
          {isAdmin && showForm && (
            <GlassCard strong shimmer className="mb-5 card-stagger-1">
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                New Notification
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(260 30% 45%)", fontFamily: "Outfit, sans-serif" }}>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Notice title…"
                    className="glass-input"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(260 30% 45%)", fontFamily: "Outfit, sans-serif" }}>Content</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write the notification content…"
                    rows={4}
                    className="glass-input resize-none"
                    maxLength={800}
                  />
                </div>
                <button
                  onClick={handlePost}
                  disabled={posting || !title.trim() || !content.trim()}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {posting
                    ? <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <Send size={15} />
                  }
                  {posting ? "Posting…" : "Post Notification"}
                </button>
              </div>
            </GlassCard>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in-up"
              style={{ background: "rgba(239,68,68,0.12)", color: "hsl(0 72% 48%)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-[20px] h-24 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.2)", animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && notices.length === 0 && !error && (
            <GlassCard className="text-center py-12">
              <Bell size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(265 50% 55%)" }} />
              <p className="font-semibold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>No notifications yet</p>
              <p className="text-sm mt-1" style={muted}>{isAdmin ? "Post the first notice above." : "Check back later."}</p>
            </GlassCard>
          )}

          {/* Notice list */}
          <div className="space-y-3">
            {notices.map((n, i) => (
              <GlassCard
                key={n.id}
                className={`card-stagger-${Math.min(i + 1, 6)}`}
                shimmer={i === 0}
              >
                {/* Top highlight */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="icon-badge bg-violet-400/20 shrink-0 mt-0.5">
                      <Bell size={16} className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-snug" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={muted}>{n.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-medium" style={{ color: "hsl(265 40% 55%)" }}>
                          {formatDate(n.postedAt)}
                        </span>
                        <span className="text-[10px]" style={muted}>by {n.postedBy}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={deleting === n.id}
                      className="shrink-0 rounded-xl p-2 transition-all hover:bg-red-100/40 active:scale-95"
                      style={{ color: "hsl(0 72% 55%)" }}
                      title="Delete"
                    >
                      {deleting === n.id
                        ? <span className="inline-block h-4 w-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
