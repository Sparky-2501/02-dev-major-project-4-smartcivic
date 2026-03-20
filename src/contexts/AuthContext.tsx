import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type AuthorityDomain = Database["public"]["Enums"]["authority_domain"];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  domain: AuthorityDomain | null;
  profile: { name: string; email: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: "citizen" | "authority", domain?: AuthorityDomain) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [domain, setDomain] = useState<AuthorityDomain | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [roleRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role, domain").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("name, email").eq("user_id", userId).maybeSingle(),
    ]);

    if (roleRes.data) {
      setRole(roleRes.data.role);
      setDomain(roleRes.data.domain);
    }
    if (profileRes.data) {
      setProfile(profileRes.data);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setRole(null);
        setDomain(null);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    selectedRole: "citizen" | "authority",
    selectedDomain?: AuthorityDomain
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: "Signup failed" };

    // Insert role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: selectedRole,
      domain: selectedRole === "authority" ? selectedDomain : null,
    });

    if (roleError) return { error: roleError.message };

    setRole(selectedRole);
    setDomain(selectedRole === "authority" ? selectedDomain ?? null : null);

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setDomain(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, domain, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
