import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { loginUser, logoutUser } from "@/firebase/auth";
import { getUserProfile, UserProfile } from "@/firebase/firestore";

export type UserRole = "admin" | "lecturer" | "student";

// Re-export UserProfile as User for components
export type User = UserProfile;

interface AuthContextType {
  user:    User | null;
  loading: boolean;
  login:   (id: string, password: string, role: UserRole) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true until Firebase resolves

  // Listen to Firebase auth state — handles page refresh/persistence automatically
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (id: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const { profile } = await loginUser(id, password, role);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  }, []);

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
