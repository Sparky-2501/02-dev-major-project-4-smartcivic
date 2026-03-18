import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import {
  CheckCircle, Clock, AlertTriangle, Users, TrendingUp, Upload,
  BarChart3, Award
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const weeklyData = [
  { day: "Mon", resolved: 12, reported: 18 },
  { day: "Tue", resolved: 15, reported: 14 },
  { day: "Wed", resolved: 20, reported: 22 },
  { day: "Thu", resolved: 18, reported: 16 },
  { day: "Fri", resolved: 25, reported: 20 },
  { day: "Sat", resolved: 10, reported: 8 },
  { day: "Sun", resolved: 8, reported: 6 },
];

const assignedIssues = [
  { id: 1, title: "Large pothole on Main Road", location: "Sector 7-G", status: "in_progress", priority: "high", reported: "2h ago" },
  { id: 2, title: "Garbage overflow at Block D", location: "Green Park", status: "assigned", priority: "medium", reported: "4h ago" },
  { id: 3, title: "Water pipe leakage", location: "Lake Road", status: "in_progress", priority: "high", reported: "6h ago" },
  { id: 4, title: "Broken streetlight", location: "Tech Park Ave", status: "assigned", priority: "low", reported: "1d ago" },
];

const leaderboard = [
  { name: "Officer R. Sharma", dept: "Roads & Infrastructure", resolved: 142, avgTime: "3.1h" },
  { name: "Officer K. Patel", dept: "Sanitation", resolved: 128, avgTime: "2.8h" },
  { name: "Officer M. Singh", dept: "Water & Sewage", resolved: 115, avgTime: "4.5h" },
  { name: "Officer A. Kumar", dept: "Electrical", resolved: 98, avgTime: "5.2h" },
  { name: "Officer S. Gupta", dept: "Traffic", resolved: 87, avgTime: "3.8h" },
];

const statusMap: Record<string, { label: string; class: string }> = {
  assigned: { label: "Assigned", class: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", class: "bg-warning/10 text-warning" },
  resolved: { label: "Resolved", class: "bg-success/10 text-success" },
};

const priorityMap: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export default function AuthorityPage() {
  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Authority Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and resolve civic issues</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <CheckCircle className="w-5 h-5" />, label: "Resolved", value: "1,247", color: "text-success" },
            { icon: <Clock className="w-5 h-5" />, label: "Pending", value: "43", color: "text-warning" },
            { icon: <TrendingUp className="w-5 h-5" />, label: "Resolution Rate", value: "94%", color: "text-primary" },
            { icon: <Users className="w-5 h-5" />, label: "Avg Response", value: "4.2h", color: "text-accent" },
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

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Chart */}
          <GlassCard delay={0.1} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Weekly Activity</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="reported" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />Reported</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" />Resolved</span>
            </div>
          </GlassCard>

          {/* Assigned Issues */}
          <GlassCard delay={0.15} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="font-semibold">Assigned Issues</h3>
            </div>
            <div className="space-y-3">
              {assignedIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.location} · {issue.reported}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-xs font-medium ${priorityMap[issue.priority]}`}>{issue.priority}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusMap[issue.status].class}`}>
                      {statusMap[issue.status].label}
                    </span>
                    {issue.status === "in_progress" && (
                      <button className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Leaderboard */}
        <GlassCard delay={0.2} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-warning" />
            <h3 className="font-semibold">Public Transparency — Top Officials</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 px-2 font-medium">#</th>
                  <th className="text-left py-3 px-2 font-medium">Name</th>
                  <th className="text-left py-3 px-2 font-medium">Department</th>
                  <th className="text-left py-3 px-2 font-medium">Resolved</th>
                  <th className="text-left py-3 px-2 font-medium">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((officer, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2">
                      {i < 3 ? (
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-warning/20 text-warning" : i === 1 ? "bg-muted text-muted-foreground" : "bg-warning/10 text-warning/70"
                        }`}>{i + 1}</span>
                      ) : (
                        <span className="text-muted-foreground ml-1.5">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 font-medium">{officer.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{officer.dept}</td>
                    <td className="py-3 px-2 font-mono text-success">{officer.resolved}</td>
                    <td className="py-3 px-2 font-mono">{officer.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
