import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { FileText, Plus, Trash2, X, Send } from "lucide-react";
import {
  getCirculars,
  addCircular,
  deleteCircular,
} from "@/firebase/firestore";
import type { Circular } from "@/firebase/firestore";

const CircularsPage = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === "admin";

  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [title,     setTitle]     = useState("");
  const [desc,      setDesc]      = useState("");
  const [posting,   setPosting]   = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCirculars();
      setCirculars(data);
      if (data[0]) localStorage.setItem("seen_circular", data[0].id);
    } catch {
      setError("Failed to load circulars. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!title.trim() || !desc.trim()) return;
    setPosting(true);
    try {
      await addCircular(title.trim(), desc.trim(), user?.name || "Admin");
      setTitle("");
      setDesc("");
      setShowForm(false);
      await load();
    } catch {
      setError("Failed to post circular.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteCircular(id);
      setCirculars(prev => prev.filter(c => c.id !== id));
    } catch {
      setError("Failed to delete circular.");
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
                Circulars
              </h1>
              <p className="text-sm" style={muted}>{circulars.length} circular{circulars.length !== 1 ? "s" : ""}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95"
                style={{
                  fontFamily: "Outfit, sans-serif",
                  background: showForm ? "rgba(239,68,68,0.12)" : "rgba(236,72,153,0.15)",
                  color: showForm ? "hsl(0 72% 50%)" : "hsl(320 80% 48%)",
                  border: `1px solid ${showForm ? "rgba(239,68,68,0.25)" : "rgba(236,72,153,0.25)"}`,
                }}
              >
                {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Post Circular</>}
              </button>
            )}
          </div>

          {/* Post form */}
          {isAdmin && showForm && (
            <GlassCard strong shimmer className="mb-5 card-stagger-1">
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                New Circular
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(260 30% 45%)", fontFamily: "Outfit, sans-serif" }}>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Circular title…"
                    className="glass-input"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(260 30% 45%)", fontFamily: "Outfit, sans-serif" }}>Description</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Write the circular details…"
                    rows={4}
                    className="glass-input resize-none"
                    maxLength={800}
                  />
                </div>
                <button
                  onClick={handlePost}
                  disabled={posting || !title.trim() || !desc.trim()}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {posting
                    ? <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <Send size={15} />
                  }
                  {posting ? "Posting…" : "Post Circular"}
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

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-[20px] h-24 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.2)", animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && circulars.length === 0 && !error && (
            <GlassCard className="text-center py-12">
              <FileText size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(320 60% 55%)" }} />
              <p className="font-semibold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>No circulars yet</p>
              <p className="text-sm mt-1" style={muted}>{isAdmin ? "Post the first circular above." : "Check back later."}</p>
            </GlassCard>
          )}

          {/* Circular list */}
          <div className="space-y-3">
            {circulars.map((c, i) => (
              <GlassCard
                key={c.id}
                className={`card-stagger-${Math.min(i + 1, 6)}`}
                shimmer={i === 0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="icon-badge bg-fuchsia-400/20 shrink-0 mt-0.5">
                      <FileText size={16} className="text-fuchsia-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-snug" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                        {c.title}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={muted}>{c.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-medium" style={{ color: "hsl(320 50% 52%)" }}>
                          {formatDate(c.date)}
                        </span>
                        <span className="text-[10px]" style={muted}>by {c.author}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="shrink-0 rounded-xl p-2 transition-all hover:bg-red-100/40 active:scale-95"
                      style={{ color: "hsl(0 72% 55%)" }}
                      title="Delete"
                    >
                      {deleting === c.id
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

export default CircularsPage;
