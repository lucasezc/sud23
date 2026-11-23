import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  sessionLoading: boolean;
  sessionError: string;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const API_URL = `${(import.meta.env.VITE_API_URL ?? "http://localhost:9010/api").replace(/\/+$/, "")}/auth`;

const readStoredUser = (): AuthUser | null => {
  const saved = localStorage.getItem("authUser");
  if (!saved) return null;

  try {
    const user: unknown = JSON.parse(saved);
    if (
      user && typeof user === "object" &&
      "id" in user && typeof user.id === "string" &&
      "name" in user && typeof user.name === "string" &&
      "email" in user && typeof user.email === "string" &&
      "role" in user && (user.role === "customer" || user.role === "admin")
    ) {
      return user as AuthUser;
    }
  } catch {
    localStorage.removeItem("authUser");
  }
  return null;
};

const isAuthUser = (value: unknown): value is AuthUser =>
  Boolean(
    value && typeof value === "object" &&
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string" &&
    "email" in value && typeof value.email === "string" &&
    "role" in value && (value.role === "customer" || value.role === "admin"),
  );

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<AuthUser | null>(() =>
    localStorage.getItem("authToken") ? readStoredUser() : null,
  );
  const [sessionLoading, setSessionLoading] = useState(() => Boolean(localStorage.getItem("authToken")));
  const [sessionError, setSessionError] = useState("");

  const login = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem("authToken", nextToken);
    localStorage.setItem("authUser", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setSessionError("");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
    setSessionError("");
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setSessionLoading(false);
      setUser(null);
      return () => { active = false; };
    }

    setSessionLoading(true);
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) {
          if (active) logout();
          return null;
        }
        if (!response.ok) throw new Error("No se pudo validar la sesión con el servidor");
        const data: unknown = await response.json();
        if (!isAuthUser(data)) throw new Error("El servidor devolvió datos de sesión inválidos");
        return data;
      })
      .then((validatedUser) => {
        if (!active || !validatedUser) return;
        localStorage.setItem("authUser", JSON.stringify(validatedUser));
        setUser(validatedUser);
        setSessionError("");
      })
      .catch((error: unknown) => {
        if (active) setSessionError(error instanceof Error ? error.message : "No se pudo validar la sesión");
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });

    return () => { active = false; };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, sessionLoading, sessionError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
