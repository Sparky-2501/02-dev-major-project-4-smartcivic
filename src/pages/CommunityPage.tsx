import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageCircle, MapPin, Clock, Tag, TrendingUp, AlertTriangle, Globe } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { getIssues, getIssuesByCity } from "@/lib/api";

interface Issue {
  id: number;
  user: string;
  avatar: string;
  location: string;
  description: string;
  category: string;
  image: string;
  votes: number;
  comments: number;
  timeAgo: string;
  aiConfidence: number;
  priority: "low" | "medium" | "high";
  voted: boolean;
}

const mockIssues: Issue[] = [
  {
    id: 1, user: "Priya M.", avatar: "PM", location: "Sector 7-G, Main Road",
    description: "Large pothole near the intersection causing traffic slowdowns and vehicle damage. Multiple commuters affected daily.",
    category: "Pothole", image: "🕳️", votes: 24, comments: 8, timeAgo: "2h ago",
    aiConfidence: 94, priority: "high", voted: false,
  },
  {
    id: 2, user: "Raj K.", avatar: "RK", location: "Green Park, Block D",
    description: "Garbage overflow at community bin. Not collected for 3 days. Causing bad odor and health concerns in the area.",
    category: "Garbage", image: "🗑️", votes: 15, comments: 5, timeAgo: "4h ago",
    aiConfidence: 89, priority: "medium", voted: false,
  },
  {
    id: 3, user: "Anita S.", avatar: "AS", location: "Lake Road, Near Bridge",
    description: "Water pipe leakage flooding the sidewalk. Pedestrians forced to walk on the road. Reported twice before.",
    category: "Water Leakage", image: "💧", votes: 31, comments: 12, timeAgo: "6h ago",
    aiConfidence: 91, priority: "high", voted: false,
  },
  {
    id: 4, user: "Dev P.", avatar: "DP", location: "Tech Park Avenue",
    description: "Broken streetlight at the bus stop. Area is completely dark after 7 PM. Safety concern for commuters.",
    category: "Streetlight", image: "💡", votes: 8, comments: 3, timeAgo: "1d ago",
    aiConfidence: 96, priority: "low", voted: false,
  },
];

const categories = ["All", "Pothole", "Garbage", "Water Leakage", "Streetlight", "Traffic", "Stray Animals"];

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-primary/10 text-primary border-primary/20",
};

export default function CommunityPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState(mockIssues);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cityOnly, setCityOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const data = cityOnly && user?.city
          ? await getIssuesByCity(user.city)
          : await getIssues();
        if (Array.isArray(data) && data.length > 0) {
          setIssues(data);
        }
      } catch {
        // keep mock data on error
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [cityOnly, user?.city]);

  const filtered = activeCategory === "All" ? issues : issues.filter((i) => i.category === activeCategory);

  const handleVote = (id: number) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, votes: i.voted ? i.votes - 1 : i.votes + 1, voted: !i.voted } : i
      )
    );
  };

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Community Issues</h1>
          <p className="text-muted-foreground mt-1">See what your neighbors are reporting</p>
        </motion.div>

        {/* City filter toggle */}
        {user?.city && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-primary/5 border border-primary/20"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm flex-1">
              Showing issues from{" "}
              <span className="text-primary font-semibold">{cityOnly ? user.city : "All Cities"}</span>
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCityOnly(true)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  cityOnly ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="w-3 h-3 inline mr-1" />{user.city}
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

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
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

        {/* Issues Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((issue, i) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="glass-card-hover p-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none" />
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                          {issue.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{issue.user}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {issue.location}
                            <span className="mx-1">·</span>
                            <Clock className="w-3 h-3" /> {issue.timeAgo}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${priorityStyles[issue.priority]}`}>
                        {issue.priority === "high" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {issue.priority}
                      </span>
                    </div>

                    {/* Image placeholder */}
                    <div className="rounded-xl bg-secondary/50 border border-border/50 p-8 text-center text-4xl mb-3">
                      {issue.image}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground/80 mb-3">{issue.description}</p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">
                        <Tag className="w-3 h-3" /> {issue.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs text-primary border border-primary/20">
                        AI Verified: {issue.aiConfidence}%
                      </span>
                      {issue.votes >= 10 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-xs text-destructive border border-destructive/20">
                          <TrendingUp className="w-3 h-3" /> High Priority
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border/30">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVote(issue.id)}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          issue.voted ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${issue.voted ? "fill-primary" : ""}`} />
                        <span className="font-mono">{issue.votes}</span>
                        <span className="hidden sm:inline">I'm Facing This Too</span>
                      </motion.button>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <MessageCircle className="w-4 h-4" /> {issue.comments}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                        <MapPin className="w-4 h-4" /> View on Map
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
