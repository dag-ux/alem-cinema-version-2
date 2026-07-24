import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../api/client";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, redirectPath?: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, redirectPath?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, redirectPath?: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    // If a redirect path is provided, store it to navigate after login
    if (redirectPath) {
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
    }
  };

  const register = async (fullName: string, email: string, password: string, redirectPath?: string) => {
    const response = await api.post("/auth/register", { fullName, email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    if (redirectPath) {
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("redirectAfterLogin");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}