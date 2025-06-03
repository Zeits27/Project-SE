import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // NEW: Track token state

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setToken(""); // token loaded, but empty
      return;
    }

    setToken(storedToken); // token is valid
    fetch("http://localhost:8080/api/me", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user info", err);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
