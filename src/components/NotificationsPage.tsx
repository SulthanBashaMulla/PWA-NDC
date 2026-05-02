import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { Bell, Plus, Trash2, X, Send, Search, Clock, AlertTriangle } from "lucide-react";
import {
  getNotifications, addNotification, deleteNotification,
  deleteExpiredNotifications,
} from "@/firebase/firestore";
import type { Notice } from "@/firebase/firestore";

const NotificationsPage = () => {
  const { user }   = useAuth();
  const isAdmin    = user?.role === "admin";
  const isLecturer = user?.role === "lecturer";
  const canPost    = isAdmin || isLecturer; // both can post

  const [notices,    setNotices]    = useState<Notice[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [posting,    setPosting]    = useState(false);
  const [deleting,   setDeleting]   = useState<string|null>(null);
  const [cleaning,   setCleaning]   = useState(false);
  const [cleanMsg,   setCleanMsg]   = useState("");
  // Search + filter
  const [search,     setSearch]     = useState("");
  const [filterDate, setFilterDate] = useState(""); // YYYY-MM-DD

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

  // Search + date filter (client-side)
  const filtered = useMemo(() => {
    let r = notices;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.postedBy.toLowerCase().includes(q)
      );
    }
    if (filterDate) {
      r = r.filter(n => {
        if (!n.postedAt) return false;
        const d = n.postedAt.toDate?.() ?? new Date(n.postedAt as any);
        return d.toISOString().slice(0, 10) === filterDate;
      });
    }
    return r;
  }, [notices, search, filterDate]);

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

  const handleCleanExpired = async () => {
    setCleaning(true); setCleanMsg("");
    try {
      const count = await deleteExpiredNotifications();
      setCleanMsg(count > 0 ? `✅ Deleted ${count} expired notice${count > 1 ? "s" : ""}.` : "✅ No expired notices found.");
      await load();
    } catch { setCleanMsg("❌ Failed to clean expired notices."); }
    finally { setCleaning(false); }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  };

  const getDaysLeft = (expiresAt: any): number | null => {
    if (!expiresAt) return null;
    const exp = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const diff = exp.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-4 animate-fade-in-up">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                Notifications
              </h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>
                {filtered.length} of {notices.length} notice{notices.length!==1?"s":""}
              </p>
            </div>
            {canPost && (
              <button onClick={() => setShowForm(v => !v)}
                className={showForm ? "btn-orange" : "btn-navy"}
                style={{ width:"auto", padding:"9px 16px" }}>
                {showForm ? <><X size={14}/> Cancel</> : <><Plus size={14}/> Post Notice</>}
              </button>
            )}
          </div>

          {/* Search + Filter */}
          <div className="ndc-card mb-4 stagger-1">
            <div className="p-3 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-3)" }} />
                <input type="text" placeholder="Search title, content, author…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="ndc-input" style={{ paddingLeft:"34px", padding:"8px 8px 8px 34px" }} />
              </div>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="ndc-input" style={{ width:"auto", padding:"7px 10px", fontSize:"13px" }} />
              {(search || filterDate) && (
                <button onClick={() => { setSearch(""); setFilterDate(""); }}
                  className="text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Admin: clean expired notices */}
          {isAdmin && (
            <div className="mb-4 stagger-2">
              <div className="ndc-card">
                <div className="p-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clock size={15} style={{ color:"var(--orange)" }} />
                    <p className="text-xs font-semibold" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
                      Notices expire after 30 days. Clean manually or they hide automatically.
                    </p>
                  </div>
                  <button onClick={handleCleanExpired} disabled={cleaning}
                    className="btn-orange text-xs flex items-center gap-1.5"
                    style={{ width:"auto", padding:"7px 14px" }}>
                    {cleaning
                      ? <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      : <Trash2 size={12} />}
                    Delete Expired
                  </button>
                </div>
                {cleanMsg && (
                  <div className="px-3 pb-3 text-xs font-semibold" style={{ color: cleanMsg.startsWith("✅") ? "#059669" : "#dc2626" }}>
                    {cleanMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post form */}
          {canPost && showForm && (
            <div className="ndc-card mb-5 stagger-1">
              <div className="ndc-card-header">
                <h3>New Notification</h3>
                <Bell size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5"
                    style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>Title</label>
                  <input type="text" value={title} onChange={e=>setTitle(e.target.value)}
                    placeholder="Notice title…" className="ndc-input" maxLength={120} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5"
                    style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>Content</label>
                  <textarea value={content} onChange={e=>setContent(e.target.value)}
                    placeholder="Write the notification details…" rows={4}
                    className="ndc-input resize-none" maxLength={800} />
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color:"var(--text-3)" }}>
                  <AlertTriangle size={12} style={{ color:"var(--orange)" }} />
                  This notice will auto-expire in 30 days.
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
          {!loading && filtered.length === 0 && !error && (
            <div className="ndc-card text-center py-12">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background:"rgba(15,45,94,0.08)" }}>
                <Bell size={28} style={{ color:"var(--navy)" }} />
              </div>
              <p className="font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                {search || filterDate ? "No matching notices" : "No notifications yet"}
              </p>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>
                {search || filterDate ? "Try clearing the filters." : canPost ? "Post the first notice above." : "Check back later."}
              </p>
            </div>
          )}

          {/* Notice list */}
          <div className="space-y-3">
            {filtered.map((n, i) => {
              const daysLeft = getDaysLeft(n.expiresAt);
              const isExpiringSoon = daysLeft !== null && daysLeft <= 5;
              return (
                <div key={n.id} className={`ndc-card stagger-${Math.min(i+1,6)}`}>
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: i===0 ? "rgba(232,96,28,0.12)" : "rgba(15,45,94,0.08)" }}>
                      <Bell size={18} style={{ color: i===0 ? "var(--orange)" : "var(--navy)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-sm" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                          {n.title}
                        </p>
                        {i === 0 && <span className="badge badge-orange text-[10px]">NEW</span>}
                        {isExpiringSoon && (
                          <span className="badge badge-amber text-[10px]">
                            ⏳ Expires in {daysLeft}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed mb-2" style={{ color:"var(--text-2)" }}>{n.content}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] font-semibold" style={{ color:"var(--orange)" }}>
                          {formatDate(n.postedAt)}
                        </span>
                        <span className="text-[11px]" style={{ color:"var(--text-3)" }}>by {n.postedBy}</span>
                        {daysLeft !== null && (
                          <span className="text-[10px]" style={{ color:"var(--text-3)" }}>
                            · {daysLeft}d left
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Admin can delete any; Lecturer can delete their own */}
                    {(isAdmin || (isLecturer && n.postedBy === user?.name)) && (
                      <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                        className="rounded-xl p-2 hover:bg-red-50 active:scale-95 shrink-0"
                        style={{ color:"#ef4444" }}>
                        {deleting === n.id
                          ? <span className="h-4 w-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin inline-block" />
                          : <Trash2 size={15} />}
                      </button>
                    )}
                  </div>
                  {i === 0 && <div style={{ height:3, background:"linear-gradient(90deg,var(--navy),var(--orange))" }} />}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
