import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { MapPin, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const issues = [
  { id: 1, title: "Pothole - Main Road", location: "Sector 7-G", status: "red", x: 25, y: 35, votes: 24 },
  { id: 2, title: "Garbage Overflow", location: "Green Park", status: "yellow", x: 55, y: 20, votes: 15 },
  { id: 3, title: "Water Leakage", location: "Lake Road", status: "red", x: 70, y: 60, votes: 31 },
  { id: 4, title: "Broken Streetlight", location: "Tech Park", status: "green", x: 40, y: 70, votes: 8 },
  { id: 5, title: "Traffic Jam", location: "Highway Junction", status: "yellow", x: 15, y: 55, votes: 19 },
  { id: 6, title: "Stray Animals", location: "Residential Block C", status: "red", x: 80, y: 40, votes: 12 },
  { id: 7, title: "Road Crack", location: "Industrial Zone", status: "green", x: 60, y: 85, votes: 6 },
  { id: 8, title: "Drainage Block", location: "Market Area", status: "yellow", x: 35, y: 50, votes: 22 },
];

const statusConfig: Record<string, { color: string; ping: string; label: string; icon: React.ReactNode }> = {
  red: { color: "bg-destructive", ping: "bg-destructive", label: "Unresolved", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  yellow: { color: "bg-warning", ping: "bg-warning", label: "In Progress", icon: <Clock className="w-3.5 h-3.5" /> },
  green: { color: "bg-success", ping: "", label: "Resolved", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

export default function MapPage() {
  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Issue Map</h1>
          <p className="text-muted-foreground mt-1">All reported issues across the city</p>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4 text-sm">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2 text-muted-foreground">
              <span className={`w-3 h-3 rounded-full ${cfg.color}`} />
              {cfg.label}
            </div>
          ))}
        </div>

        {/* Map */}
        <GlassCard className="p-2 relative" delay={0.1}>
          <div className="relative w-full h-[500px] sm:h-[600px] rounded-xl overflow-hidden bg-secondary/30">
            {/* Grid lines to simulate map */}
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }} />

            {/* Zone labels */}
            <div className="absolute top-4 left-4 text-xs text-muted-foreground/50 font-mono">ZONE A - DOWNTOWN</div>
            <div className="absolute top-4 right-4 text-xs text-muted-foreground/50 font-mono">ZONE B - INDUSTRIAL</div>
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/50 font-mono">ZONE C - RESIDENTIAL</div>
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/50 font-mono">ZONE D - HARBOR</div>

            {/* Issue Pins */}
            {issues.map((issue) => {
              const cfg = statusConfig[issue.status];
              return (
                <div
                  key={issue.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${issue.x}%`, top: `${issue.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  {/* Pulse ring for unresolved */}
                  {issue.status === "red" && (
                    <span className={`absolute inset-0 w-6 h-6 rounded-full ${cfg.ping} animate-ping-slow opacity-40`} />
                  )}
                  <div className={`relative w-6 h-6 rounded-full ${cfg.color} flex items-center justify-center text-background z-10 shadow-lg`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="glass-card p-3 min-w-[180px]">
                      <p className="text-sm font-medium">{issue.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {issue.location}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`flex items-center gap-1 text-xs`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{issue.votes} votes</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
