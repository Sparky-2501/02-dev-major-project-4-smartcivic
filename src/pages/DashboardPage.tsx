import { motion } from "framer-motion";
import {
  Thermometer, Wind, Droplets, Car, Volume2, Zap,
  Activity, AlertTriangle, CheckCircle, Clock
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

const tempData = [
  { time: "00:00", value: 22 }, { time: "04:00", value: 20 },
  { time: "08:00", value: 24 }, { time: "12:00", value: 30 },
  { time: "16:00", value: 28 }, { time: "20:00", value: 25 },
];

const aqiData = [
  { time: "Mon", value: 38 }, { time: "Tue", value: 45 },
  { time: "Wed", value: 42 }, { time: "Thu", value: 50 },
  { time: "Fri", value: 35 }, { time: "Sat", value: 30 },
  { time: "Sun", value: 42 },
];

const energyData = [
  { name: "Residential", value: 35 }, { name: "Commercial", value: 28 },
  { name: "Industrial", value: 22 }, { name: "Public", value: 15 },
];

const energyColors = ["#3B82F6", "#A855F7", "#10B981", "#F59E0B"];

const trafficGauge = [{ name: "Traffic", value: 67, fill: "#3B82F6" }];

const zones = [
  { name: "Zone A - Downtown", status: "green", issues: 3, temp: "29°C", aqi: 38 },
  { name: "Zone B - Industrial", status: "yellow", issues: 12, temp: "31°C", aqi: 62 },
  { name: "Zone C - Residential", status: "green", issues: 5, temp: "27°C", aqi: 35 },
  { name: "Zone D - Harbor", status: "red", issues: 18, temp: "30°C", aqi: 78 },
  { name: "Zone E - University", status: "green", issues: 2, temp: "26°C", aqi: 30 },
];

const statusColors: Record<string, string> = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">City Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time smart city monitoring system</p>
        </motion.div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <AlertTriangle className="w-5 h-5" />, label: "Active Issues", value: "147", color: "text-destructive" },
            { icon: <Clock className="w-5 h-5" />, label: "In Progress", value: "43", color: "text-warning" },
            { icon: <CheckCircle className="w-5 h-5" />, label: "Resolved Today", value: "28", color: "text-success" },
            { icon: <Activity className="w-5 h-5" />, label: "Avg Response", value: "4.2h", color: "text-primary" },
          ].map((s, i) => (
            <GlassCard key={i} delay={i * 0.05} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold font-mono">{s.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Temperature Chart */}
          <GlassCard delay={0.1} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="w-4 h-4 text-warning" />
              <h3 className="font-semibold">Temperature (24h)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#9CA3AF" }}
                />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="url(#tempGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* AQI Chart */}
          <GlassCard delay={0.15} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-4 h-4 text-success" />
              <h3 className="font-semibold">Air Quality Index (Weekly)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aqiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {aqiData.map((entry, i) => (
                    <Cell key={i} fill={entry.value > 50 ? "#F59E0B" : "#10B981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Traffic Gauge */}
          <GlassCard delay={0.2} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Traffic Flow</h3>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={trafficGauge}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.05)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-bold font-mono text-primary">67%</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
            </div>
          </GlassCard>

          {/* Energy Usage */}
          <GlassCard delay={0.25} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-semibold">Energy Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={energyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} width={90} />
                <Tooltip
                  contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {energyData.map((_, i) => (
                    <Cell key={i} fill={energyColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* City Zones */}
        <GlassCard delay={0.3} className="p-6">
          <h3 className="font-semibold mb-4">City Zones Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 px-2 font-medium">Zone</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-left py-3 px-2 font-medium">Active Issues</th>
                  <th className="text-left py-3 px-2 font-medium">Temp</th>
                  <th className="text-left py-3 px-2 font-medium">AQI</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{z.name}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${statusColors[z.status]}`} />
                        <span className="capitalize text-muted-foreground">{z.status === "green" ? "Normal" : z.status === "yellow" ? "Warning" : "Critical"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono">{z.issues}</td>
                    <td className="py-3 px-2 font-mono">{z.temp}</td>
                    <td className="py-3 px-2 font-mono">{z.aqi}</td>
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
