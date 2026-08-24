"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse } from "@/types";
import { authApi } from "@/services/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsPasswordSetup: boolean;
  setupToken: string | null;
  pendingUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, name: string, pass: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<boolean>;
  completePasswordSetup: (password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  closePasswordSetupModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState<boolean>(false);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("todo_access_token");
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem("todo_access_token");
          localStorage.removeItem("todo_refresh_token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      if (res.access_token && res.user) {
        localStorage.setItem("todo_access_token", res.access_token);
        if (res.refresh_token) {
          localStorage.setItem("todo_refresh_token", res.refresh_token);
        }
        setUser(res.user);
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(email, name, pass);
      if (res.access_token && res.user) {
        localStorage.setItem("todo_access_token", res.access_token);
        if (res.refresh_token) {
          localStorage.setItem("todo_refresh_token", res.refresh_token);
        }
        setUser(res.user);
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.googleAuth(idToken);
      
      // RULE: If needs password setup, block entry and show modal!
      if (res.needs_password_setup) {
        setNeedsPasswordSetup(true);
        setSetupToken(res.setup_token || null);
        setPendingUser(res.user || null);
        setIsLoading(false);
        return false; // Not fully logged in yet
      }

      if (res.access_token && res.user) {
        localStorage.setItem("todo_access_token", res.access_token);
        if (res.refresh_token) {
          localStorage.setItem("todo_refresh_token", res.refresh_token);
        }
        setUser(res.user);
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const completePasswordSetup = async (password: string) => {
    if (!setupToken) throw new Error("Missing setup token");
    setIsLoading(true);
    try {
      const res = await authApi.setPassword(password, setupToken);
      if (res.access_token && res.user) {
        localStorage.setItem("todo_access_token", res.access_token);
        if (res.refresh_token) {
          localStorage.setItem("todo_refresh_token", res.refresh_token);
        }
        setUser(res.user);
        setNeedsPasswordSetup(false);
        setSetupToken(null);
        setPendingUser(null);
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closePasswordSetupModal = () => {
    setNeedsPasswordSetup(false);
    setSetupToken(null);
    setPendingUser(null);
  };

  const logout = () => {
    localStorage.removeItem("todo_access_token");
    localStorage.removeItem("todo_refresh_token");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        needsPasswordSetup,
        setupToken,
        pendingUser,
        login,
        register,
        googleLogin,
        completePasswordSetup,
        logout,
        refreshUser,
        closePasswordSetupModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
