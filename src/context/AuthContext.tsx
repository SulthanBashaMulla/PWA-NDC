// src/context/AuthContext.tsx
// Production-ready: uses real Firebase Auth + Firestore profile
// Session persists across page refreshes via Firebase's built-in persistence

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { onAuthChange, loginUser, logoutUser } from "@/firebase/auth";
import { getUserProfile, UserProfile } from "@/firebase/firestore";

export type UserRole = "admin" | "lecturer" | "student";

// Re-export UserProfile as User for backward compatibility
export type User = UserProfile;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (id: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  // Start as true — we don't know auth state yet until Firebase responds
  const [loading, setLoading] = useState(true);

  // ── Listen for Firebase Auth state changes ───────────────────
  // This fires on page load (restoring session) and on login/logout
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile && profile.status === "active") {
            setUser(profile);
          } else {
            // Profile missing or inactive — sign them out
            await logoutUser();
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(
    async (id: string, password: string, role: UserRole) => {
      setLoading(true);
      try {
        const { profile } = await loginUser(id, password, role);
        setUser(profile as User);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
