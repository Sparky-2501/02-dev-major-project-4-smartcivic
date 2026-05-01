import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { useScroll, useTransform } from "framer-motion";
import {
  Thermometer, Wind, Car, Droplets, Zap, Activity,
  AlertTriangle, ArrowRight, ChevronRight, Shield, MapPin
} from "lucide-react";

// ─── Easing ──────────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ─── Card 3D Tilt Hook ────────────────────────────────────────────────────────
function useTilt(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

// ─── Word reveal animation ────────────────────────────────────────────────────
function WordReveal({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ display: "inline" }}>
      {words.map((word, i) => (
        <span key={i} style={{ overflow: "hidden", display: "inline-block", marginRight: i < words.length - 1 ? "0.3em" : 0 }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.7, ease, delay: delay + i * 0.07 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Number count-up ─────────────────────────────────────────────────────────
function CountUp({ to, suffix = "", duration = 1.5 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Stats data ───────────────────────────────────────────────────────────────
const stats = [
  { icon: <Thermometer className="w-5 h-5" />, label: "Temperature", value: 28, suffix: "°C", trend: "+2.1°", color: "amber" },
  { icon: <Wind className="w-5 h-5" />, label: "Air Quality Index", value: 42, suffix: " AQI", trend: "Good", color: "green" },
  { icon: <Car className="w-5 h-5" />, label: "Traffic Density", value: 67, suffix: "%", trend: "Moderate", color: "blue" },
  { icon: <Droplets className="w-5 h-5" />, label: "Water Level", value: 84, suffix: "%", trend: "Optimal", color: "blue" },
  { icon: <Zap className="w-5 h-5" />, label: "Electricity", value: 42, suffix: " GW", trend: "-5.3%", color: "purple" },
  { icon: <Activity className="w-5 h-5" />, label: "Active Reports", value: 147, suffix: "", trend: "+12 today", color: "red" },
];

const colorMap: Record<string, { icon: string; ring: string; glow: string; badge: string }> = {
  amber: { icon: "text-amber-400", ring: "ring-amber-400/20", glow: "rgba(251,191,36,0.2)", badge: "bg-amber-400/10 text-amber-400" },
  green: { icon: "text-emerald-400", ring: "ring-emerald-400/20", glow: "rgba(52,211,153,0.2)", badge: "bg-emerald-400/10 text-emerald-400" },
  blue: { icon: "text-blue-400", ring: "ring-blue-400/20", glow: "rgba(96,165,250,0.2)", badge: "bg-blue-400/10 text-blue-400" },
  purple: { icon: "text-violet-400", ring: "ring-violet-400/20", glow: "rgba(167,139,250,0.2)", badge: "bg-violet-400/10 text-violet-400" },
  red: { icon: "text-red-400", ring: "ring-red-400/20", glow: "rgba(248,113,113,0.2)", badge: "bg-red-400/10 text-red-400" },
};

// ─── Animated stat card ───────────────────────────────────────────────────────
function StatCard({ icon, label, value, suffix, trend, color, delay }: typeof stats[0] & { delay: number }) {
  const c = colorMap[color];
  const tilt = useTilt(6);
  return (
    <motion.div
      {...tilt}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease, delay }}
      className="glass-card p-5 group"
      style={{ transition: "box-shadow 0.3s, transform 0.1s ease-out" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} bg-white/5 ring-1 ${c.ring} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{trend}</span>
      </div>
      {/* Value */}
      <div className="font-mono text-3xl font-bold tracking-tight mb-1">
        <CountUp to={value} suffix={suffix} />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${c.glow}, transparent 70%)` }}
      />
    </motion.div>
  );
}

// ─── How It Works card ────────────────────────────────────────────────────────
const features = [
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Report",
    desc: "Upload a photo. AI detects the issue type and auto-fills category, location, and priority.",
    color: "blue",
    step: "01",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Track",
    desc: "Real-time status updates from reported → assigned → in progress → resolved.",
    color: "purple",
    step: "02",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verify",
    desc: "Authorities upload proof. Citizens verify the fix. Full public transparency.",
    color: "green",
    step: "03",
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomePage() {
  const howRef = useRef(null);

  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ["start 80%", "center center"],
  });

  const howScale = useTransform(howProgress, [0, 1], [0.9, 1]);
  const howBlur = useTransform(howProgress, [0, 1], ["8px", "0px"]);
  const howOpacity = useTransform(howProgress, [0, 1], [0, 1]);
  const howY = useTransform(howProgress, [0, 1], [120, 0]);
  // Parallax orbs follow cursor slightly
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orb1X = useSpring(mouseX, { damping: 60, stiffness: 80 });
  const orb1Y = useSpring(mouseY, { damping: 60, stiffness: 80 });
  const orb2X = useSpring(mouseX, { damping: 80, stiffness: 50 });
  const orb2Y = useSpring(mouseY, { damping: 80, stiffness: 50 });

  const { scrollYProgress } = useScroll();

  // Transformations
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const blur = useTransform(scrollYProgress, [0, 0.5], ["0px", "16px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const origin = useTransform(scrollYProgress, [0, 0.5], ["50% 0%", "50% 50%"]);

  const sectionScale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const sectionBlur = useTransform(scrollYProgress, [0, 0.5], ["10px", "0px"]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.5], [120, 0]);

  const bgX = useTransform(orb1X, (v) => v * -0.8);
  const bgY = useTransform(orb1Y, (v) => v * -0.8);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 40;
      const cy = (e.clientY / window.innerHeight - 0.5) * 40;
      mouseX.set(cx);
      mouseY.set(cy);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="min-h-screen bg-grid overflow-hidden">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <motion.section
        style={{ scale, filter: blur, opacity, y }}
        className="relative pt-32 pb-24 px-4 overflow-hidden"
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/city.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.5,
              filter: "blur(3px)",
              x: bgX,
              y: bgY,
              WebkitMaskImage:
                "radial-gradient(circle at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0) 80%)",
              maskImage:
                "radial-gradient(circle at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0) 80%)",
            }}
          />

          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[130px] animate-orb"
            style={{ x: orb1X, y: orb1Y }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[130px] animate-orb-reverse"
            style={{ x: orb2X, y: orb2Y }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 rounded-full blur-[180px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Live City Monitoring Active — 147 reports this week
          </motion.div>

          {/* H1 word reveal */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6">
            <WordReveal text="Smart Civic AI" delay={0.2} className="text-gradient-primary block" />
            <br />
            <WordReveal text="A Smarter Way to" delay={0.5} className="text-foreground/90" />
            {" "}
            <WordReveal text="Fix Cities" delay={0.72} className="text-gradient-civic" />
          </h1>

          {/* Subtitle fade */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.9 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            AI-powered civic issue reporting. Real-time city monitoring.
            Report problems, track resolutions, hold leaders accountable.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/report"
              className="btn-morph inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-white font-bold text-base animate-glow-pulse"
            >
              <AlertTriangle className="w-5 h-5" />
              Report an Issue
            </Link>
            <Link
              to="/dashboard"
              className="btn-morph inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm text-foreground font-bold text-base hover:border-primary/30"
            >
              View City Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-20 flex flex-col items-center gap-2 text-muted-foreground/50"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-2 rounded-full bg-white/30" />
            </motion.div>
            <span className="text-xs tracking-widest uppercase">Scroll</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ── LIVE STATS ─────────────────────────────────────────────────────── */}
      <motion.section
        style={{
          scale: sectionScale,
          filter: sectionBlur,
          opacity: sectionOpacity,
          y: sectionY,
        }}
        className="px-4 pb-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">Live Metrics</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Your City. Right Now.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <motion.section
        ref={howRef}
        style={{
          scale: howScale,
          filter: howBlur,
          opacity: howOpacity,
          y: howY,
        }}
        className="px-4 pb-32 relative mt-32"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From citizen reports to authority resolution — tracked transparently in real time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {features.map((f, i) => {
              const tilt = useTilt(10);
              const c = colorMap[f.color];
              return (
                <motion.div
                  key={i}
                  {...tilt}
                  initial={{ opacity: 0, y: 50, rotateX: 15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease, delay: i * 0.12 }}
                  className="glass-card p-7 group relative overflow-hidden"
                  style={{ transformStyle: "preserve-3d", transition: "box-shadow 0.3s, transform 0.1s ease-out" }}
                >
                  {/* Step number */}
                  <div className="absolute top-5 right-5 text-5xl font-black text-white/4 select-none">
                    {f.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.icon} bg-white/5 ring-1 ${c.ring} mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {f.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                  {/* Bottom glow on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${c.glow.replace("0.2", "0.8")}, transparent)` }}
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/community"
                className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold underline-draw hover:gap-2.5 transition-all"
              >
                View Community Issues <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── CITY STATS STRIP ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 1, scale: 1, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="border-t border-white/5 py-12 px-4 relative overflow-hidden"
        style={{
          transform: "none",
          filter: "none",
          opacity: 1,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Issues Resolved", value: 2400, suffix: "+" },
              { label: "Active Citizens", value: 14000, suffix: "+" },
              { label: "Cities Covered", value: 20, suffix: "" },
              { label: "Avg Resolution", value: 4, suffix: " hrs" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              >
                <div className="text-4xl font-black font-mono text-gradient-primary">
                  <CountUp to={s.value} suffix={s.suffix} duration={2} />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
