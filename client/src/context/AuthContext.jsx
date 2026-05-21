// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { fetchMe, updateProfile } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // wait for /me check on mount

  // On mount: if token exists, fetch real user from DB
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetchMe()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("fm_user");
      })
      .finally(() => setLoading(false));
  }, []);

  // Called after register or login — store token + user
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("fm_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fm_user");
    setUser(null);
  };

  // Update profile in DB + local state
  const updateUser = async (updates) => {
    try {
      const updatedUser = await updateProfile(updates);
      setUser(updatedUser);
      localStorage.setItem("fm_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      // Fallback: update local state only (offline mode)
      setUser((prev) => ({ ...(prev || {}), ...updates }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
