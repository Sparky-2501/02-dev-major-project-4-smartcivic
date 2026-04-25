import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Clock, CheckCircle, MapPin, ThumbsUp, Tag } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { domainLabels, statusLabels } from "@/lib/domainMapping";
import { getCityWeather } from "@/lib/weatherApi";
import { getIssuesByUser, getIssues } from "@/lib/api";

type Issue = Tables<"issues">;

export default function CitizenDashboard() {
  const { user, profile } = useAuth();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [communityIssues, setCommunityIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
const [weatherData, setWeatherData] = useState<any>(null);

useEffect(() => {
  if (!user?.city) return;

  const fetchWeather = async () => {
    const data = await getCityWeather(user.city);
    setWeatherData(data);
  };

  fetchWeather();

  const interval = setInterval(fetchWeather, 60 * 60 * 1000);

  return () => clearInterval(interval);
}, [user]);

  const stats = [
    { icon: <AlertTriangle className="w-5 h-5" />, label: "My Reports", value: myIssues.length.toString(), color: "text-primary" },
    { icon: <Clock className="w-5 h-5" />, label: "Pending", value: myIssues.filter(i => i.status !== "resolved").length.toString(), color: "text-warning" },
    { icon: <CheckCircle className="w-5 h-5" />, label: "Resolved", value: myIssues.filter(i => i.status === "resolved").length.toString(), color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, <span className="text-primary">{profile?.name || "Citizen"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Your civic reporting dashboard</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link to="/report">
            <GlassCard hover className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Report Issue</p>
                    <p className="text-xs text-muted-foreground">Upload a photo, AI detects the problem</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </GlassCard>
          </Link>
          <Link to="/community">
            <GlassCard hover className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Community Feed</p>
                    <p className="text-xs text-muted-foreground">See what neighbors are reporting</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((s, i) => (
            <GlassCard key={i} delay={i * 0.05} className="p-4">
              <div className="flex items-center gap-3">
                <div className={s.color}>{s.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold font-mono">{s.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* My Issues */}
        <GlassCard delay={0.1} className="p-6 mb-6">
          <h3 className="font-semibold mb-4">My Reported Issues</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">You haven't reported any issues yet.</p>
          ) : (
            <div className="space-y-3">
              {myIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {issue.location}
                      <Tag className="w-3 h-3 ml-1" /> {domainLabels[issue.domain]}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusLabels[issue.status].class}`}>
                    {statusLabels[issue.status].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Community Issues */}
        <GlassCard delay={0.15} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Trending Community Issues</h3>
            <Link to="/community" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {communityIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No issues yet.</p>
          ) : (
            <div className="space-y-3">
              {communityIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.location} · {issue.upvote_count} votes</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusLabels[issue.status].class}`}>
                    {statusLabels[issue.status].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
