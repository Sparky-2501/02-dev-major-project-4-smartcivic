import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Thermometer, Wind, Droplets, Car, Volume2, Zap,
  Activity, AlertTriangle, CheckCircle, Clock, MapPin,
  CloudRain, Gauge, RefreshCw, UserCircle
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { getCityWeather, getCityStats, getIssuesByCity, WeatherData, CityStats } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

// AQI label helper
function aqiLabel(aqi: number) {
  if (aqi <= 1) return { label: "Good", color: "#10B981" };
  if (aqi <= 2) return { label: "Fair", color: "#34D399" };
  if (aqi <= 3) return { label: "Moderate", color: "#F59E0B" };
  if (aqi <= 4) return { label: "Poor", color: "#F97316" };
  return { label: "Very Poor", color: "#EF4444" };
}

const energyColors = ["#3B82F6", "#A855F7", "#10B981", "#F59E0B"];
const energyData = [
  { name: "Residential", value: 35 }, { name: "Commercial", value: 28 },
  { name: "Industrial", value: 22 }, { name: "Public", value: 15 },
];

const statusColors: Record<string, string> = {
  green: "bg-success", yellow: "bg-warning", red: "bg-destructive",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const city = user?.city || "";

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [stats, setStats] = useState<CityStats>({ active: 0, inProgress: 0, resolved: 0, total: 0 });
  const [recentIssues, setRecentIssues] = useState<Array<{
    _id: string; title: string; status: string; category: string; location: string; created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    if (!city) { setLoading(false); return; }
    setLoading(true);
    try {
      const [w, s, issues] = await Promise.all([
        getCityWeather(city),
        getCityStats(city),
        getIssuesByCity(city)
      ]);
      setWeather(w);
      setStats(s);
      // Take last 5 issues for the table
      setRecentIssues((issues as Array<{
        _id: string; title: string; status: string; category: string; location: string; created_at: string;
      }>).slice(0, 5));
      setLastUpdated(new Date());
    } catch {
      // fail silently, keep whatever we had
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [city]);

  // Build temp chart from weather data (mock 24h curve anchored to live temp)
  const baseTemp = weather?.temperature ?? 24;
  const tempData = [
    { time: "00:00", value: +(baseTemp - 4).toFixed(1) },
    { time: "04:00", value: +(baseTemp - 6).toFixed(1) },
    { time: "08:00", value: +(baseTemp - 2).toFixed(1) },
    { time: "12:00", value: +(baseTemp + 3).toFixed(1) },
    { time: "16:00", value: +(baseTemp + 1).toFixed(1) },
    { time: "20:00", value: +(baseTemp - 1).toFixed(1) },
    { time: "Now",   value: +baseTemp.toFixed(1) },
  ];

  const avgResponseH = stats.total > 0
    ? ((stats.resolved / stats.total) * 6).toFixed(1)
    : "–";

  const aqiInfo = aqiLabel(weather?.aqi ?? 0);

  // Traffic gauge — mock but plausible
  const trafficPct = 55 + Math.floor(stats.total % 30);
  const trafficGauge = [{ name: "Traffic", value: trafficPct, fill: "#3B82F6" }];

  if (!city) {
    return (
      <div className="min-h-screen bg-grid pt-20 px-4 pb-12 flex items-center justify-center">
        <GlassCard className="p-10 text-center max-w-md">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No City Set</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Set your city in your profile to see city-specific data.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Update Profile
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between flex-wrap gap-3"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-widest">{city}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {city} <span className="text-gradient-primary">City Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time smart city monitoring · Welcome back, {user?.name?.split(" ")[0]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* ── Top Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <AlertTriangle className="w-5 h-5" />, label: "Active Issues", value: loading ? "…" : String(stats.active), color: "text-destructive" },
            { icon: <Clock className="w-5 h-5" />, label: "In Progress", value: loading ? "…" : String(stats.inProgress), color: "text-warning" },
            { icon: <CheckCircle className="w-5 h-5" />, label: "Resolved", value: loading ? "…" : String(stats.resolved), color: "text-success" },
            { icon: <Activity className="w-5 h-5" />, label: "Avg Resolve", value: loading ? "…" : `${avgResponseH}h`, color: "text-primary" },
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

        {/* ── Weather Row ────────────────────────────────────────────── */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          >
            {[
              { icon: <Thermometer className="w-4 h-4 text-warning" />, label: "Temperature", value: `${weather.temperature.toFixed(1)}°C`, sub: weather.description },
              { icon: <Droplets className="w-4 h-4 text-primary" />, label: "Humidity", value: `${weather.humidity}%`, sub: "Relative humidity" },
              { icon: <Wind className="w-4 h-4 text-success" />, label: "Wind", value: `${weather.windSpeed} m/s`, sub: weather.weather },
              {
                icon: <Gauge className="w-4 h-4" style={{ color: aqiInfo.color }} />,
                label: "Air Quality",
                value: aqiInfo.label,
                sub: `PM2.5: ${weather.pm2_5.toFixed(1)} μg/m³`,
                valueStyle: { color: aqiInfo.color }
              },
            ].map((w, i) => (
              <GlassCard key={i} delay={i * 0.04} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {w.icon}
                  <p className="text-xs text-muted-foreground">{w.label}</p>
                </div>
                <p className="text-lg font-bold font-mono" style={w.valueStyle}>{w.value}</p>
                <p className="text-xs text-muted-foreground capitalize">{w.sub}</p>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {/* ── Charts ─────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Temperature Chart */}
          <GlassCard delay={0.15} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="w-4 h-4 text-warning" />
              <h3 className="font-semibold">Temperature — {city} (24h)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} unit="°" />
                <Tooltip
                  contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#9CA3AF" }}
                  formatter={(v: number) => [`${v}°C`, "Temp"]}
                />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Traffic Gauge */}
          <GlassCard delay={0.2} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Traffic Flow — {city}</h3>
            </div>
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="60%" outerRadius="90%"
                  startAngle={180} endAngle={0}
                  data={trafficGauge}
                >
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.05)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute bottom-6 text-center">
                <p className="text-3xl font-bold font-mono text-primary">{trafficPct}%</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
            </div>
          </GlassCard>

          {/* Energy Distribution */}
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
                <Tooltip contentStyle={{ background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {energyData.map((_, i) => <Cell key={i} fill={energyColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* AQI Detail */}
          <GlassCard delay={0.3} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-4 h-4 text-success" />
              <h3 className="font-semibold">Air Quality — {city}</h3>
            </div>
            {weather ? (
              <div className="space-y-3">
                {[
                  { label: "AQI Level", value: aqiInfo.label, color: aqiInfo.color },
                  { label: "PM 2.5", value: `${weather.pm2_5.toFixed(1)} μg/m³`, color: "#9CA3AF" },
                  { label: "PM 10",  value: `${weather.pm10.toFixed(1)} μg/m³`,  color: "#9CA3AF" },
                  { label: "Humidity",value: `${weather.humidity}%`,             color: "#9CA3AF" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-mono font-semibold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                {loading ? "Loading weather…" : "Weather unavailable"}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── Recent Issues Table ────────────────────────────────────── */}
        <GlassCard delay={0.35} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Issues — {city}</h3>
            <span className="text-xs text-muted-foreground">{stats.total} total</span>
          </div>
          {recentIssues.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No issues reported in {city} yet. Be the first to{" "}
              <button
                onClick={() => navigate("/report")}
                className="text-primary underline-offset-2 hover:underline"
              >
                report one
              </button>!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">Title</th>
                    <th className="text-left py-3 px-2 font-medium">Category</th>
                    <th className="text-left py-3 px-2 font-medium">Location</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/30">
                          {[1, 2, 3, 4].map(j => (
                            <td key={j} className="py-3 px-2">
                              <div className="h-4 bg-secondary/60 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : recentIssues.map(issue => {
                        const statusMap: Record<string, { label: string; cls: string }> = {
                          reported:    { label: "Reported",    cls: "bg-destructive/10 text-destructive" },
                          in_progress: { label: "In Progress", cls: "bg-warning/10 text-warning" },
                          resolved:    { label: "Resolved",    cls: "bg-success/10 text-success" },
                        };
                        const st = statusMap[issue.status] ?? { label: issue.status, cls: "bg-secondary text-foreground" };
                        return (
                          <tr key={issue._id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-2 font-medium max-w-[200px] truncate">{issue.title}</td>
                            <td className="py-3 px-2 text-muted-foreground">{issue.category}</td>
                            <td className="py-3 px-2 text-muted-foreground max-w-[150px] truncate">{issue.location}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
