import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Thermometer,
  Wind,
  Car,
  Droplets,
  Zap,
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Shield,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { GlassCard } from "@/components/GlassCard";

const stats = [
  { icon: <Thermometer className="w-5 h-5" />, label: "Temperature", value: "28", unit: "°C", trend: "+2.1°", color: "amber" as const, delay: 0.1 },
  { icon: <Wind className="w-5 h-5" />, label: "Air Quality Index", value: "42", unit: "AQI", trend: "Good", color: "green" as const, delay: 0.15 },
  { icon: <Car className="w-5 h-5" />, label: "Traffic Density", value: "67", unit: "%", trend: "Moderate", color: "blue" as const, delay: 0.2 },
  { icon: <Droplets className="w-5 h-5" />, label: "Water Level", value: "84", unit: "%", trend: "Optimal", color: "blue" as const, delay: 0.25 },
  { icon: <Zap className="w-5 h-5" />, label: "Electricity Usage", value: "4.2", unit: "GW", trend: "-5.3%", color: "purple" as const, delay: 0.3 },
  { icon: <Activity className="w-5 h-5" />, label: "Active Reports", value: "147", trend: "+12 today", color: "red" as const, delay: 0.35 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live City Monitoring Active
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-gradient-primary">Smart Civic AI</span>
              <br />
              <span className="text-foreground/90">A Smarter Way to Fix Cities</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              AI-powered civic issue reporting and real-time smart city monitoring.
              Report problems, track resolutions, and keep your city accountable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <AlertTriangle className="w-5 h-5" />
                Report Issue
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-secondary text-secondary-foreground font-semibold text-base transition-all hover:border-primary/30 hover:bg-secondary/80"
              >
                View City Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From citizen reports to authority resolution — all tracked transparently.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <AlertTriangle className="w-6 h-6" />,
                title: "Report",
                desc: "Upload a photo. AI detects the issue type and auto-fills details.",
                color: "blue" as const,
              },
              {
                icon: <Activity className="w-6 h-6" />,
                title: "Track",
                desc: "Watch real-time status updates from reported to resolved.",
                color: "purple" as const,
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Verify",
                desc: "Authorities upload proof. Citizens verify the fix. Full transparency.",
                color: "green" as const,
              },
            ].map((f, i) => (
              <GlassCard key={i} hover delay={i * 0.1} className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-${f.color === "blue" ? "primary" : f.color === "purple" ? "accent" : "success"}/10 flex items-center justify-center text-${f.color === "blue" ? "primary" : f.color === "purple" ? "accent" : "success"} mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/community"
              className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
            >
              View Community Issues <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
