import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { AlertTriangle, UserCheck, Wrench, CheckCircle, Clock, MapPin, Camera } from "lucide-react";

const timeline = [
  {
    status: "reported",
    label: "Issue Reported",
    time: "Mar 15, 2026 - 09:14 AM",
    desc: "Citizen Priya M. reported a large pothole on Main Road, Sector 7-G.",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "bg-destructive",
    glowColor: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
  },
  {
    status: "assigned",
    label: "Authority Assigned",
    time: "Mar 15, 2026 - 10:30 AM",
    desc: "Officer R. Sharma (Roads & Infrastructure) has been assigned.",
    icon: <UserCheck className="w-5 h-5" />,
    color: "bg-primary",
    glowColor: "shadow-[0_0_15px_rgba(59,130,246,0.4)]",
  },
  {
    status: "in_progress",
    label: "Work in Progress",
    time: "Mar 16, 2026 - 08:00 AM",
    desc: "Repair crew dispatched. Work commenced on site.",
    icon: <Wrench className="w-5 h-5" />,
    color: "bg-warning",
    glowColor: "shadow-[0_0_15px_rgba(245,158,11,0.4)]",
  },
  {
    status: "resolved",
    label: "Issue Resolved",
    time: "Mar 17, 2026 - 02:45 PM",
    desc: "Repair completed. Proof photo uploaded. Awaiting citizen verification.",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "bg-success",
    glowColor: "shadow-[0_0_15px_rgba(16,185,129,0.4)]",
  },
];

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Issue Tracking</h1>
          <p className="text-muted-foreground mt-1">Follow the resolution journey</p>
        </motion.div>

        {/* Issue Summary */}
        <GlassCard className="p-6 mb-8" delay={0.1}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Large Pothole on Main Road</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Sector 7-G, Main Road</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Reported 2 days ago</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                  ✓ Resolved
                </span>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                  AI Verified: 94%
                </span>
                <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/20">
                  24 confirmations
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Timeline */}
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-destructive via-warning to-success" />

          <div className="space-y-8">
            {timeline.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, ease: [0.2, 0, 0, 1] }}
                className="relative"
              >
                {/* Node */}
                <div className={`absolute -left-8 top-1 w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-background z-10 ${step.glowColor}`}>
                  {step.icon}
                </div>

                <GlassCard className="p-5 ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{step.label}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{step.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>

                  {step.status === "resolved" && (
                    <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border/30 flex items-center gap-3">
                      <Camera className="w-5 h-5 text-success" />
                      <div>
                        <p className="text-sm font-medium">Proof Photo Uploaded</p>
                        <p className="text-xs text-muted-foreground">Verified by 18 of 24 reporters</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
