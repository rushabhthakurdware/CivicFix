import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import client from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        try {
          const res = await client.get("/auth/profile");
          setUser(res.data.user);
        } catch {
          await SecureStore.deleteItemAsync("token");
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    await SecureStore.setItemAsync("token", res.data.data.token);
    setUser(res.data.data.user);
  };

  const register = async (full_name, email, password, phone) => {
    await client.post("/auth/register", {
      full_name,
      email,
      password,
      phone,
      role: "CITIZEN",
    });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);