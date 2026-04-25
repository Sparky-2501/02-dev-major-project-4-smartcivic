import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Activity, Mail, Lock, User, Building2, Eye, EyeOff,
  Phone, MapPin, ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthorityDomain =
  | "road_department" | "garbage_management" | "water_supply"
  | "electricity" | "traffic_department" | "animal_control" | "public_infrastructure";

const domainLabels: Record<AuthorityDomain, string> = {
  road_department: "Road Department",
  garbage_management: "Garbage Management",
  water_supply: "Water Supply",
  electricity: "Electricity",
  traffic_department: "Traffic Department",
  animal_control: "Animal Control",
  public_infrastructure: "Public Infrastructure",
};

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"
];

// ─── Animated Input ─────────────────────────────────────────────────────────
function AnimInput({
  label, icon, type = "text", value, onChange, placeholder, required, right, id
}: {
  label: string; icon: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
  right?: React.ReactNode; id: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="group">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        {/* animated left accent */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
          animate={{ scaleY: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ originY: 0.5 }}
        />
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </div>
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full bg-white/5 border rounded-xl pl-10 ${right ? "pr-10" : "pr-4"} py-3 text-sm transition-all duration-200 focus:outline-none ${
            focused
              ? "border-primary/60 bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              : "border-white/10 hover:border-white/20"
          }`}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
    </div>
  );
}

// ─── Animated Select ────────────────────────────────────────────────────────
function AnimSelect({
  label, icon, value, onChange, options, id
}: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; options: { value: string; label: string }[]; id: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
          animate={{ scaleY: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ originY: 0.5 }}
        />
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </div>
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm transition-all duration-200 focus:outline-none appearance-none cursor-pointer ${
            focused
              ? "border-primary/60 bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-[#0d1117]">{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AuthPage() {
  const { user, login, signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [selectedRole, setSelectedRole] = useState<"citizen" | "authority">("citizen");
  const [selectedDomain, setSelectedDomain] = useState<AuthorityDomain>("road_department");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (user.role === "authority") return <Navigate to="/authority-dashboard" replace />;
    return <Navigate to="/citizen-dashboard" replace />;
  }

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const loggedInUser = await login(email, password);
        if (!loggedInUser) {
          triggerShake();
          toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
        }
      } else {
        const success = await signup({ name, email, password, phone, city, role: selectedRole, domain: selectedRole === "authority" ? selectedDomain : undefined });
        if (success) {
          toast({ title: "Account created! 🎉", description: `Welcome to SmartCivic, ${name}. Please sign in.` });
          setMode("login");
          setEmail(email);
          setPassword("");
        } else {
          triggerShake();
          toast({ title: "Signup failed", description: "Email may already be registered", variant: "destructive" });
        }
      }
    } catch {
      triggerShake();
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const formVariants = {
    hidden: { opacity: 0, x: mode === "login" ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: mode === "login" ? 20 : -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.4, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 glow-blue"
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Activity className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Smart<span className="text-gradient-primary">Civic</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Welcome back, city hero 👋" : "Join your city's voice 🏙️"}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-white/5 mb-6">
          {(["login", "signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {mode === m && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{m === "login" ? "Sign In" : "Create Account"}</span>
            </button>
          ))}
        </div>

        {/* Card with shake animation */}
        <motion.div
          animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="glass-card p-7"
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* SIGNUP FIELDS */}
              {mode === "signup" && (
                <>
                  <AnimInput id="name" label="Full Name" icon={<User className="w-4 h-4" />} value={name} onChange={setName} placeholder="Prathamesh Shelke" required />

                  <div className="grid grid-cols-2 gap-3">
                    <AnimInput id="phone" label="Phone" icon={<Phone className="w-4 h-4" />} value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                    <AnimSelect
                      id="city"
                      label="Your City"
                      icon={<MapPin className="w-4 h-4" />}
                      value={city}
                      onChange={setCity}
                      options={INDIAN_CITIES.map(c => ({ value: c, label: c }))}
                    />
                  </div>

                  {/* Role selector */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Account Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["citizen", "authority"] as const).map(r => (
                        <motion.button
                          key={r}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedRole(r)}
                          className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                            selectedRole === r
                              ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                              : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                          }`}
                        >
                          {r === "citizen" ? "🏠 Citizen" : "🏛️ Authority"}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedRole === "authority" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <AnimSelect
                          id="domain"
                          label="Department"
                          icon={<Building2 className="w-4 h-4" />}
                          value={selectedDomain}
                          onChange={v => setSelectedDomain(v as AuthorityDomain)}
                          options={Object.entries(domainLabels).map(([v, l]) => ({ value: v, label: l }))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* EMAIL + PASSWORD (both modes) */}
              <AnimInput id="email" label="Email" icon={<Mail className="w-4 h-4" />} type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />

              <AnimInput
                id="password"
                label="Password"
                icon={<Lock className="w-4 h-4" />}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                right={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* SUBMIT */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-50 mt-2"
              >
                {/* shimmer sweep on idle */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? <ChevronRight className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span className="relative z-10">{mode === "login" ? "Sign In" : "Create Account"}</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* Switch mode hint */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          {mode === "login" ? "New to SmartCivic? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary font-semibold hover:underline transition-all"
          >
            {mode === "login" ? "Create account →" : "Sign in →"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
