import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cell } from "recharts";
import {
  CheckCircle, Clock, AlertTriangle, TrendingUp, Upload,
  BarChart3, MapPin, Tag
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { domainLabels, statusLabels } from "@/lib/domainMapping";
import { useToast } from "@/hooks/use-toast";
import type { Tables, Database } from "@/integrations/supabase/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

type Issue = Tables<"issues">;
type IssueStatus = Database["public"]["Enums"]["issue_status"];

export default function AuthorityDashboard() {
  const { user, profile, domain } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    if (!domain) return;
    const { data } = await supabase
      .from("issues")
      .select("*")
      .eq("domain", domain)
      .order("created_at", { ascending: false });
    setIssues(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, [domain]);

  const updateStatus = async (issueId: string, newStatus: IssueStatus) => {
    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", issueId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Issue marked as ${newStatus.replace("_", " ")}` });
      fetchIssues();
    }
  };

  const reported = issues.filter(i => i.status === "reported").length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const resolved = issues.filter(i => i.status === "resolved").length;

  const chartData = [
    { name: "Reported", value: reported },
    { name: "In Progress", value: inProgress },
    { name: "Resolved", value: resolved },
  ];
  const chartColors = ["#EF4444", "#F59E0B", "#10B981"];

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Authority Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {domain ? domainLabels[domain] : "Department"} — {profile?.name || "Officer"}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <AlertTriangle className="w-5 h-5" />, label: "Total Issues", value: issues.length.toString(), color: "text-primary" },
            { icon: <Clock className="w-5 h-5" />, label: "Reported", value: reported.toString(), color: "text-destructive" },
            { icon: <TrendingUp className="w-5 h-5" />, label: "In Progress", value: inProgress.toString(), color: "text-warning" },
            { icon: <CheckCircle className="w-5 h-5" />, label: "Resolved", value: resolved.toString(), color: "text-success" },
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

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <GlassCard delay={0.1} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Issue Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Assigned Issues */}
          <div className="lg:col-span-2">
            <GlassCard delay={0.15} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="font-semibold">Assigned Issues — {domain ? domainLabels[domain] : ""}</h3>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : issues.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No issues assigned to your department.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {issues.map((issue) => (
                    <div key={issue.id} className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {issue.location}</span>
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {issue.category}</span>
                            {issue.priority === "high" && (
                              <span className="text-destructive font-medium">🔥 High Priority</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusLabels[issue.status].class}`}>
                          {statusLabels[issue.status].label}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                        {issue.status === "reported" && (
                          <button
                            onClick={() => updateStatus(issue.id, "in_progress")}
                            className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium hover:bg-warning/20 transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {issue.status === "in_progress" && (
                          <button
                            onClick={() => updateStatus(issue.id, "resolved")}
                            className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" /> Mark Resolved
                          </button>
                        )}
                        {issue.status === "resolved" && (
                          <span className="text-xs text-success flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
