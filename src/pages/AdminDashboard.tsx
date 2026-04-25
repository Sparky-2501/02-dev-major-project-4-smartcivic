import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, AlertTriangle, CheckCircle, Clock, BarChart3,
  Shield, Activity, ArrowRight, TrendingUp
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { domainLabels, statusLabels } from "@/lib/domainMapping";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie
} from "recharts";


import { getIssues } from "@/lib/api";

type Issue = Tables<"issues">;
type UserRole = Tables<"user_roles">;
type Profile = Tables<"profiles">;

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<(UserRole & { profile?: Profile })[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const load = async () => {
    const issuesData = await getIssues();
    setIssues(issuesData || []);
    setLoading(false);
  };
  load();
}, []);

  const reported = issues.filter(i => i.status === "reported").length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const resolved = issues.filter(i => i.status === "resolved").length;
  const citizens = users.filter(u => u.role === "citizen").length;
  const authorities = users.filter(u => u.role === "authority").length;

  // Domain distribution
  const domainCounts = Object.entries(domainLabels).map(([key, label]) => ({
    name: label,
    value: issues.filter(i => i.domain === key).length,
  })).filter(d => d.value > 0);

  const pieColors = ["#3B82F6", "#A855F7", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Full system overview and management</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { icon: <AlertTriangle className="w-5 h-5" />, label: "Total Issues", value: issues.length, color: "text-primary" },
            { icon: <Clock className="w-5 h-5" />, label: "Reported", value: reported, color: "text-destructive" },
            { icon: <TrendingUp className="w-5 h-5" />, label: "In Progress", value: inProgress, color: "text-warning" },
            { icon: <CheckCircle className="w-5 h-5" />, label: "Resolved", value: resolved, color: "text-success" },
            { icon: <Users className="w-5 h-5" />, label: "Total Users", value: users.length, color: "text-accent" },
          ].map((s, i) => (
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

        {/* Quick nav */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Smart City Dashboard", path: "/dashboard", icon: <Activity className="w-5 h-5" />, color: "text-primary" },
            { label: "Issue Map", path: "/map", icon: <AlertTriangle className="w-5 h-5" />, color: "text-warning" },
            { label: "Community Feed", path: "/community", icon: <Users className="w-5 h-5" />, color: "text-accent" },
          ].map((item, i) => (
            <Link key={i} to={item.path}>
              <GlassCard hover delay={i * 0.05} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={item.color}>{item.icon}</div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Domain chart */}
          <GlassCard delay={0.1} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Issues by Department</h3>
            </div>
            {domainCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={domainCounts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} width={120} />
                  <Tooltip contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {domainCounts.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No issues yet</p>
            )}
          </GlassCard>

          {/* User management */}
          <GlassCard delay={0.15} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-accent" />
              <h3 className="font-semibold">User Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-2xl font-bold font-mono text-primary">{citizens}</p>
                <p className="text-xs text-muted-foreground">Citizens</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
                <p className="text-2xl font-bold font-mono text-accent">{authorities}</p>
                <p className="text-xs text-muted-foreground">Authorities</p>
              </div>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {profiles.map((p) => {
                const userRole = users.find(u => u.user_id === p.user_id);
                return (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      userRole?.role === "admin" ? "bg-primary/10 text-primary" :
                      userRole?.role === "authority" ? "bg-accent/10 text-accent" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {userRole?.role ?? "unknown"}
                      {userRole?.domain ? ` · ${domainLabels[userRole.domain]}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* All Issues */}
        <GlassCard delay={0.2} className="p-6">
          <h3 className="font-semibold mb-4">All Issues</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">Title</th>
                    <th className="text-left py-3 px-2 font-medium">Category</th>
                    <th className="text-left py-3 px-2 font-medium">Department</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.slice(0, 20).map((issue) => (
                    <tr key={issue.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-2 font-medium max-w-[200px] truncate">{issue.title}</td>
                      <td className="py-3 px-2 text-muted-foreground">{issue.category}</td>
                      <td className="py-3 px-2 text-muted-foreground">{domainLabels[issue.domain]}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${statusLabels[issue.status].class}`}>
                          {statusLabels[issue.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono">{issue.upvote_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {issues.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No issues in the system yet.</p>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
