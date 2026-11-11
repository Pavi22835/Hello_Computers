import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./auth.context";
import { getCurrentUser } from "../services/auth.service";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("hello-user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("hello-user");
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("hello-access-token")
  );

  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (user) {
      localStorage.setItem("hello-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hello-user");
    }
  }, [user]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setLoading(false);
    localStorage.removeItem("hello-access-token");
    localStorage.removeItem("hello-user");
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const expireSession = () => logout();
    window.addEventListener("auth:expired", expireSession);
    return () => {
      active = false;
      window.removeEventListener("auth:expired", expireSession);
    };
  }, [token, logout]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setLoading(false);

    localStorage.setItem("hello-access-token", newToken);
    localStorage.setItem("hello-user", JSON.stringify(newUser));
  };

  const updateUser = (updatedUser) => setUser(updatedUser);
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}