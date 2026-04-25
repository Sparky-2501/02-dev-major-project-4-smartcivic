import { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "citizen" | "authority" | "admin";

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: UserRole;
  domain?: string;
  avatar?: string;
  bio?: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  role?: "citizen" | "authority";
  domain?: string;
};

type UpdateProfileData = {
  name: string;
  phone: string;
  city: string;
  bio?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; message: string }>;
  // legacy compat
  role?: UserRole | null;
  profile?: User | null;
  signOut?: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API = "http://localhost:5000/api";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("sc_token");
    const savedUser = localStorage.getItem("sc_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (_) {
        localStorage.removeItem("sc_token");
        localStorage.removeItem("sc_user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem("sc_token", data.token);
    localStorage.setItem("sc_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (formData: SignupData): Promise<boolean> => {
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    return res.ok;
  };

  const logout = () => {
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    if (!user) return false;
    const res = await fetch(`${API}/auth/profile/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return false;
    const result = await res.json();
    const updatedUser = { ...user, ...result.user };
    localStorage.setItem("sc_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return true;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { ok: false, message: "Not logged in" };
    const res = await fetch(`${API}/auth/change-password/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    return { ok: res.ok, message: data.message };
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
      // legacy compat aliases
      role: user?.role ?? null,
      profile: user,
      signOut: logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};