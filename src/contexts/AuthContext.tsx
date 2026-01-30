import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import type { User, LoginResponse, CheckSessionResponse } from "@/types/api";

type UserRole = "admin" | "editor" | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.get<CheckSessionResponse>("/auth/check-session.php");
      
      if (response.authenticated && response.user) {
        setUser(response.user);
        setUserRole(response.user.role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>("/auth/login.php", {
        email,
        password,
      });

      if (response.success && response.user) {
        setUser(response.user);
        setUserRole(response.user.role);
        return { error: null };
      }

      return { error: new Error("Login failed") };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout.php");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUser(null);
      setUserRole(null);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signOut,
    isAdmin: userRole === "admin",
    isEditor: userRole === "editor" || userRole === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
