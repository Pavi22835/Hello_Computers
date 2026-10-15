import {
  createContext,
  useEffect,
  useState,
} from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("hello-user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("hello-access-token")
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "hello-user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("hello-user");
    }
  }, [user]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem(
      "hello-access-token",
      newToken
    );

    localStorage.setItem(
      "hello-user",
      JSON.stringify(newUser)
    );
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("hello-access-token");
    localStorage.removeItem("hello-user");
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}