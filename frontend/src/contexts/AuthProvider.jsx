import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Register (replaces Firebase createUserWithEmailAndPassword) ─────────────
  const createUser = async (name, email, password, branch) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include", // required so the refresh-token cookie is stored
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");
      setUser(data.user);
      setToken(data.accessToken);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // ── Login (replaces Firebase signInWithEmailAndPassword) ─────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log in");
      setUser(data.user);
      setToken(data.accessToken);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout (replaces Firebase signOut) ────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  // ── Silent refresh on load ────────────────────────────────────────────────────
  // Firebase used to restore a session automatically via onAuthStateChanged;
  // this does the same job using the httpOnly refresh cookie.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!refreshRes.ok) {
          setUser(null);
          setToken(null);
          return;
        }
        const { accessToken } = await refreshRes.json();
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setUser(me);
          setToken(accessToken);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const authInfo = {
    user,
    token,
    loading,
    createUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
