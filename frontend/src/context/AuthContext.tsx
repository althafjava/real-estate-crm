import { createContext, useContext, useState, type ReactNode } from "react";
import { api, setToken } from "../lib/api";
import type { User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): User | null {
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser());

  function persist(response: AuthResponse) {
    setToken(response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  }

  async function login(email: string, password: string) {
    persist(await api.post<AuthResponse>("/auth/login", { email, password }));
  }

  async function register(name: string, email: string, password: string) {
    persist(await api.post<AuthResponse>("/auth/register", { name, email, password }));
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
