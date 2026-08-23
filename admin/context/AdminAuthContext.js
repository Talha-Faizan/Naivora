"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/admin/me");
      if (res.data && res.data.role === "admin") {
        setAdmin(res.data);
        setIsAdmin(true);
      } else {
        setAdmin(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin Auth Check Failed:", err.response?.data || err.message);
      setAdmin(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/adminlogin", { email, password });
      
      if (res.data.token) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: res.data.token }),
        });
      }

      await fetchAdmin();
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      await fetch("/api/auth/session", { method: "DELETE" });
      setAdmin(null);
      setIsAdmin(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAdmin,
        loading,
        login,
        logout,
        fetchAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
