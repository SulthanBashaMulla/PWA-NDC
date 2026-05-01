import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { Bell, Plus, Trash2, X, Send } from "lucide-react";
import { getNotifications, addNotification, deleteNotification } from "@/firebase/firestore";
import type { Notice } from "@/firebase/firestore";

const NotificationsPage = () => {
  const { user }   = useAuth();
  const isAdmin    = user?.role === "admin";
  const [notices,  setNotices]  = useState<Notice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [deleting, setDeleting] = useState<string|null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const d = await getNotifications();
      setNotices(d);
      if (d[0]) localStorage.setItem("seen_notice", d[0].id);
    } catch { setError("Failed to load. Check connection."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    try {
      await addNotification(title.trim(), content.trim(), user?.name || "Admin");
      setTitle(""); setContent(""); setShowForm(false);
      await load();
    } catch { setError("Failed to post."); }
    finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await deleteNotification(id); setNotices(p => p.filter(n => n.id !== id)); }
    catch { setError("Failed to delete."); }
    finally { setDeleting(null); }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 animate-fade-in-up">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                Notifications
              </h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>{notices.length} notice{notices.length!==1?"s":""}</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(v => !v)}
                className={showForm ? "btn-orange" : "btn-navy"}
                style={{ width:"auto", padding:"9px 16px" }}>
                {showForm ? <><X size={14}/> Cancel</> : <><Plus size={14}/> Post Notice</>}
              </button>
            )}
          </div>

          {/* Post form */}
          {isAdmin && showForm && (
            <div className="ndc-card mb-5 stagger-1">
              <div className="ndc-card-header">
                <h3>New Notification</h3>
                <Bell size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>Title</label>
                  <input type="text" value={title} onChange={e=>setTitle(e.target.value)}
                    placeholder="Notice title…" className="ndc-input" maxLength={120} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>Content</label>
                  <textarea value={content} onChange={e=>setContent(e.target.value)}
                    placeholder="Write the notification details…" rows={4}
                    className="ndc-input resize-none" maxLength={800} />
                </div>
                <button onClick={handlePost}
                  disabled={posting || !title.trim() || !content.trim()}
                  className="btn-orange w-full" style={{ padding:"11px 16px" }}>
                  {posting
                    ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <Send size={14} />}
                  {posting ? "Posting…" : "Post Notification"}
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold animate-fade-in"
              style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-[16px] h-24 animate-pulse" style={{ background:"rgba(15,45,94,0.06)" }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && notices.length === 0 && !error && (
            <div className="ndc-card text-center py-12">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background:"rgba(15,45,94,0.08)" }}>
                <Bell size={28} style={{ color:"var(--navy)" }} />
              </div>
              <p className="font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>No notifications yet</p>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>
                {isAdmin ? "Post the first notice above." : "Check back later."}
              </p>
            </div>
          )}

          {/* Notice list */}
          <div className="space-y-3">
            {notices.map((n, i) => (
              <div key={n.id} className={`ndc-card stagger-${Math.min(i+1,6)}`}>
                <div className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: i === 0 ? "rgba(232,96,28,0.12)" : "rgba(15,45,94,0.08)" }}>
                    <Bell size={18} style={{ color: i === 0 ? "var(--orange)" : "var(--navy)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-sm" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                        {n.title}
                      </p>
                      {i === 0 && <span className="badge badge-orange text-[10px]">NEW</span>}
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color:"var(--text-2)" }}>{n.content}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold" style={{ color:"var(--orange)" }}>
                        {formatDate(n.postedAt)}
                      </span>
                      <span className="text-[11px]" style={{ color:"var(--text-3)" }}>by {n.postedBy}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                      className="rounded-xl p-2 transition-all hover:bg-red-50 active:scale-95 shrink-0"
                      style={{ color:"#ef4444" }}>
                      {deleting === n.id
                        ? <span className="h-4 w-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin inline-block" />
                        : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
                {/* Bottom accent bar for first item */}
                {i === 0 && <div style={{ height:3, background:"linear-gradient(90deg,var(--navy),var(--orange))" }} />}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
