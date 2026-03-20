import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Activity, Mail, Lock, User, Building2, Eye, EyeOff } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AuthorityDomain = Database["public"]["Enums"]["authority_domain"];

const domainLabels: Record<AuthorityDomain, string> = {
  road_department: "Road Department",
  garbage_management: "Garbage Management",
  water_supply: "Water Supply",
  electricity: "Electricity",
  traffic_department: "Traffic Department",
  animal_control: "Animal Control",
  public_infrastructure: "Public Infrastructure",
};

export default function AuthPage() {
  const { user, role, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"citizen" | "authority">("citizen");
  const [selectedDomain, setSelectedDomain] = useState<AuthorityDomain>("road_department");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && role) {
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role === "authority") return <Navigate to="/authority-dashboard" replace />;
    return <Navigate to="/citizen-dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) toast({ title: "Login failed", description: error, variant: "destructive" });
    } else {
      const { error } = await signUp(email, password, name, selectedRole, selectedRole === "authority" ? selectedDomain : undefined);
      if (error) {
        toast({ title: "Signup failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Please check your email to confirm your account." });
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-4 pt-20 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3 glow-blue">
            <Activity className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            Smart<span className="text-primary">Civic</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-secondary border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["citizen", "authority"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          selectedRole === r
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-secondary border-border text-muted-foreground hover:border-primary/20"
                        }`}
                      >
                        {r === "citizen" ? "🏠 Citizen" : "🏛️ Authority"}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedRole === "authority" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <label className="block text-sm font-medium mb-1.5">Department</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value as AuthorityDomain)}
                        className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                      >
                        {Object.entries(domainLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
