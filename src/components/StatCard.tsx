import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  color?: "blue" | "green" | "purple" | "amber" | "red";
  delay?: number;
}

const colorMap = {
  blue: { text: "text-primary", bg: "bg-primary/10", glow: "glow-blue", border: "border-primary/20" },
  green: { text: "text-success", bg: "bg-success/10", glow: "glow-green", border: "border-success/20" },
  purple: { text: "text-accent", bg: "bg-accent/10", glow: "glow-purple", border: "border-accent/20" },
  amber: { text: "text-warning", bg: "bg-warning/10", glow: "", border: "border-warning/20" },
  red: { text: "text-destructive", bg: "bg-destructive/10", glow: "", border: "border-destructive/20" },
};

export function StatCard({ icon, label, value, unit, trend, color = "blue", delay = 0 }: StatCardProps) {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0, 0, 1] }}
      className={`glass-card-hover p-5`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-mono ${c.text}`}>{trend}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
}
