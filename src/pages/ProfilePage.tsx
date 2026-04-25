import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Building2, Shield, Edit3,
  Save, X, Lock, Eye, EyeOff, CheckCircle, Camera, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"
];

const roleColors: Record<string, string> = {
  citizen: "text-primary bg-primary/10 border-primary/20",
  authority: "text-accent bg-accent/10 border-accent/20",
  admin: "text-destructive bg-destructive/10 border-destructive/20",
};

const roleEmojis: Record<string, string> = {
  citizen: "🏠",
  authority: "🏛️",
  admin: "🛡️",
};

// Generic animated row
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

// Animated input for edit mode
function EditInput({
  label, icon, type = "text", value, onChange, placeholder, options
}: {
  label: string; icon: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  options?: string[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
          animate={{ scaleY: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ originY: 0.5 }}
        />
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${focused ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </div>
        {options ? (
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none appearance-none cursor-pointer ${
              focused ? "border-primary/60 bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-white/10"
            }`}
          >
            {options.map(o => <option key={o} value={o} className="bg-[#0d1117]">{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none ${
              focused ? "border-primary/60 bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-white/10"
            }`}
          />
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"profile" | "security">("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "Mumbai");
  const [bio, setBio] = useState(user?.bio || "");

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  if (!user) return <Navigate to="/auth" replace />;

  const startEdit = () => {
    setName(user.name || "");
    setPhone(user.phone || "");
    setCity(user.city || "Mumbai");
    setBio(user.bio || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateProfile({ name, phone, city, bio });
    setSaving(false);
    if (ok) {
      toast({ title: "Profile updated ✨", description: "Your changes have been saved." });
      setEditing(false);
    } else {
      toast({ title: "Update failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    setChangingPw(true);
    const { ok, message } = await changePassword(currentPw, newPw);
    setChangingPw(false);
    if (ok) {
      toast({ title: "Password changed ✅", description: message });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } else {
      toast({ title: "Failed", description: message, variant: "destructive" });
    }
  };

  // Avatar initials
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account and city preferences</p>
        </motion.div>

        {/* Hero card — avatar + name + role */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-2xl font-black text-white glow-blue">
                {initials}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[user.role]}`}>
                  {roleEmojis[user.role]} {user.role}
                </span>
                {user.city && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-white/10 text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {user.city}
                  </span>
                )}
              </div>
            </div>

            {!editing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-white/5 mb-5"
        >
          {(["profile", "security"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === t && (
                <motion.div
                  layoutId="profile-tab"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {t === "profile" ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {t === "profile" ? "Profile Info" : "Security"}
              </span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── PROFILE TAB ─── */}
          {tab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-6 space-y-4"
                  >
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Edit Your Profile
                    </h3>
                    <EditInput label="Full Name" icon={<User className="w-4 h-4" />} value={name} onChange={setName} placeholder="Your full name" />
                    <EditInput label="Phone Number" icon={<Phone className="w-4 h-4" />} value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                    <EditInput label="Your City" icon={<MapPin className="w-4 h-4" />} value={city} onChange={setCity} options={INDIAN_CITIES} />
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Bio</label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell the city a little about yourself..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50"
                      >
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save Changes"}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setEditing(false)}
                        className="px-6 py-3 rounded-xl bg-secondary border border-border text-sm font-semibold hover:border-white/20 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-6"
                  >
                    <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={user.name} />
                    <InfoRow icon={<Mail className="w-4 h-4" />} label="Email Address" value={user.email} />
                    <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone Number" value={user.phone || "Not set"} />
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="City" value={user.city || "Not set"} />
                    {user.domain && <InfoRow icon={<Building2 className="w-4 h-4" />} label="Department" value={user.domain.replace(/_/g, " ")} />}
                    {user.bio && (
                      <div className="py-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bio</p>
                        <p className="text-sm">{user.bio}</p>
                      </div>
                    )}
                    <div className="pt-3 mt-2 border-t border-white/5">
                      <p className="text-xs text-muted-foreground">
                        🏙️ Your reports and feed are filtered for <span className="text-primary font-semibold">{user.city || "your city"}</span>. Update city above to switch.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── SECURITY TAB ─── */}
          {tab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card p-6"
            >
              <h3 className="font-bold text-base flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-primary" /> Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <CheckCircle className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${confirmPw && confirmPw === newPw ? "text-green-400" : "text-muted-foreground"}`} />
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                      className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all ${
                        confirmPw && confirmPw !== newPw
                          ? "border-destructive/60 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                          : "border-white/10 focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                      }`}
                    />
                  </div>
                  {confirmPw && confirmPw !== newPw && (
                    <p className="text-xs text-destructive mt-1">Passwords don't match</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={changingPw}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 mt-2"
                >
                  {changingPw ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Lock className="w-4 h-4" /> Update Password</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}