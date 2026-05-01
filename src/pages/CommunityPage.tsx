import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp, MessageCircle, MapPin, Clock, Tag, TrendingUp,
  AlertTriangle, Globe, Image as ImageIcon, X, Plus, Send, Loader2
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { getIssues, getIssuesByCity, upvoteIssue, createIssue } from "@/lib/api";
import { categoryToDomain } from "@/lib/domainMapping";
import { useToast } from "@/hooks/use-toast";

// ─── DB issue shape ────────────────────────────────────────────────────────
interface DBIssue {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  created_by: string;
  status: "reported" | "in_progress" | "resolved";
  upvote_count: number;
  upvoted_by: string[];
  image_url: string;
  created_at: string;
}

const categories = ["All", "Pothole", "Garbage Overflow", "Water Leakage", "Broken Streetlight", "Traffic Obstruction", "Stray Animals"];

const priorityFromVotes = (votes: number): "high" | "medium" | "low" =>
  votes >= 20 ? "high" : votes >= 10 ? "medium" : "low";

const priorityStyles = {
  high:   "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low:    "bg-primary/10 text-primary border-primary/20",
};

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Inline post form ──────────────────────────────────────────────────────
function PostIssueForm({ city, userId, onPost }: {
  city: string; userId: string; onPost: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [location, setLocation] = useState("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5 MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImageBase64(b64);
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await createIssue({
      title, description, category,
      domain: categoryToDomain[category] || "public_infrastructure",
      location, city, created_by: userId,
      image_url: imageBase64 || ""
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Issue posted! 🎉" });
      setOpen(false);
      setTitle(""); setDescription(""); setLocation(""); setImageBase64(""); setImagePreview("");
      onPost();
    }
  };

  if (!open) {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm">Share an issue in {city}…</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Report a New Issue</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Issue title…"
        className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={category} onChange={e => setCategory(e.target.value)}
          className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="text" value={location} onChange={e => setLocation(e.target.value)}
          placeholder="Location…"
          className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <textarea
        rows={3} value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Describe the issue…"
        className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
      />

      {/* Image upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 transition-colors cursor-pointer overflow-hidden"
      >
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-xl" />
            <button
              onClick={e => { e.stopPropagation(); setImageBase64(""); setImagePreview(""); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">Attach a photo (optional, max 5 MB)</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "Posting…" : "Post Issue"}
      </motion.button>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user } = useAuth();
  const city = user?.city || "";

  const [issues, setIssues] = useState<DBIssue[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cityOnly, setCityOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = cityOnly && city
        ? await getIssuesByCity(city)
        : await getIssues();
      if (Array.isArray(data) && data.length > 0) {
        setIssues(data as DBIssue[]);
      } else {
        setIssues([]);
      }
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, [cityOnly, city]);

  const filtered = activeCategory === "All"
    ? issues
    : issues.filter(i => i.category === activeCategory);

  const handleVote = async (issue: DBIssue) => {
    if (!user) return;
    const updated = await upvoteIssue(issue._id, user._id);
    if (updated?._id) {
      setIssues(prev => prev.map(i => i._id === updated._id ? updated : i));
    }
  };

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Community Issues</h1>
          <p className="text-muted-foreground mt-1">
            See what your neighbors are reporting{city ? ` in ${city}` : ""}
          </p>
        </motion.div>

        {/* City toggle */}
        {city && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-primary/5 border border-primary/20"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm flex-1">
              Showing issues from{" "}
              <span className="text-primary font-semibold">{cityOnly ? city : "All Cities"}</span>
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCityOnly(true)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  cityOnly ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="w-3 h-3 inline mr-1" />{city}
              </button>
              <button
                onClick={() => setCityOnly(false)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  !cityOnly ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-3 h-3 inline mr-1" />All Cities
              </button>
            </div>
          </motion.div>
        )}

        {/* Post form */}
        {user && city && (
          <div className="mb-5">
            <PostIssueForm city={city} userId={user._id} onPost={fetchIssues} />
          </div>
        )}

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Issues feed */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/60" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-secondary/60 rounded w-32" />
                    <div className="h-2 bg-secondary/60 rounded w-24" />
                  </div>
                </div>
                <div className="h-32 bg-secondary/60 rounded-xl mb-3" />
                <div className="h-3 bg-secondary/60 rounded w-full mb-1" />
                <div className="h-3 bg-secondary/60 rounded w-3/4" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No issues found for these filters.</p>
              {user && city && (
                <p className="text-sm text-muted-foreground mt-1">Be the first to report one above!</p>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {filtered.map((issue, i) => {
                const priority = priorityFromVotes(issue.upvote_count);
                const voted = user ? issue.upvoted_by.includes(user._id) : false;
                // Initials from created_by (could be name or ID)
                const initials = issue.created_by?.substring(0, 2)?.toUpperCase() || "SC";

                return (
                  <motion.div
                    key={issue._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="glass-card-hover p-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none" />
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{issue.title}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" /> {issue.location || issue.city}
                                <span className="mx-1">·</span>
                                <Clock className="w-3 h-3" /> {timeAgo(issue.created_at)}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${priorityStyles[priority]}`}>
                            {priority === "high" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {priority}
                          </span>
                        </div>

                        {/* Photo */}
                        {issue.image_url ? (
                          <div
                            className="rounded-xl overflow-hidden mb-3 cursor-pointer"
                            onClick={() => setExpandedImage(issue.image_url)}
                          >
                            <img
                              src={issue.image_url}
                              alt={issue.title}
                              className="w-full max-h-60 object-cover hover:opacity-90 transition-opacity"
                            />
                          </div>
                        ) : (
                          <div className="rounded-xl bg-secondary/50 border border-border/50 p-6 text-center mb-3">
                            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
                            <p className="text-xs text-muted-foreground mt-1">No photo attached</p>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-foreground/80 mb-3">{issue.description}</p>

                        {/* Tags */}
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">
                            <Tag className="w-3 h-3" /> {issue.category}
                          </span>
                          {issue.city && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs text-primary border border-primary/20">
                              <MapPin className="w-3 h-3" /> {issue.city}
                            </span>
                          )}
                          {issue.upvote_count >= 10 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-xs text-destructive border border-destructive/20">
                              <TrendingUp className="w-3 h-3" /> Trending
                            </span>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVote(issue)}
                            className={`flex items-center gap-2 text-sm transition-colors ${
                              voted ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${voted ? "fill-primary" : ""}`} />
                            <span className="font-mono">{issue.upvote_count}</span>
                            <span className="hidden sm:inline">I'm Facing This Too</span>
                          </motion.button>

                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            issue.status === "resolved"    ? "bg-success/10 text-success" :
                            issue.status === "in_progress" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {issue.status === "in_progress" ? "In Progress" :
                             issue.status === "resolved"    ? "Resolved"    : "Reported"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={expandedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
