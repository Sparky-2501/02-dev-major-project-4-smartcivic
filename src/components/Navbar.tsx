import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X, LogIn, LogOut, UserCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Only Home and Sign-In are visible to unauthenticated guests
const guestItems = [
  { label: "Home", path: "/" },
];

const citizenItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Community", path: "/community" },
  { label: "Report Issue", path: "/report" },
  { label: "Map", path: "/map" },
  { label: "Profile", path: "/profile" },
];

const authorityItems = [
  { label: "Home", path: "/" },
  { label: "My Dashboard", path: "/authority-dashboard" },
  { label: "Community", path: "/community" },
  { label: "Map", path: "/map" },
  { label: "Profile", path: "/profile" },
];

const adminItems = [
  { label: "Home", path: "/" },
  { label: "Admin", path: "/admin-dashboard" },
  { label: "City Dashboard", path: "/dashboard" },
  { label: "Community", path: "/community" },
  { label: "Map", path: "/map" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  let navItems = guestItems;
  if (role === "citizen") navItems = citizenItems;
  else if (role === "authority") navItems = authorityItems;
  else if (role === "admin") navItems = adminItems;

  const handleSignOut = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-blue">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Smart<span className="text-primary">Civic</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm rounded-lg transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}

            {/* Auth area */}
            <div className="ml-2 pl-2 border-l border-border/50 flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span className="font-medium">{profile?.name?.split(" ")[0] || "User"}</span>
                    {profile?.city && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-[10px]">
                        <MapPin className="w-2.5 h-2.5" />{profile.city}
                      </span>
                    )}
                    {role && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                        {role}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm ${
                    location.pathname === item.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/50">
                {user ? (
                  <>
                    {profile?.city && (
                      <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{profile.city}</span>
                        {role && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{role}</span>}
                      </div>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
