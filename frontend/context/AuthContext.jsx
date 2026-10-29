"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [roleResolved, setRoleResolved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasToken = Boolean(localStorage.getItem("accessToken"));
      setIsLoggedIn(hasToken);
      if (!hasToken) setRoleResolved(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isLoggedIn) {
      return () => {
        cancelled = true;
      };
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      const timer = window.setTimeout(() => setRoleResolved(true), 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    fetch(`${API_BASE_URL}/api/vendor/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!cancelled) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            setIsLoggedIn(false);
            setIsVendor(false);
            setRoleResolved(true);
            return;
          }
          if (response.ok || response.status === 404) {
            setIsVendor(response.ok);
            setRoleResolved(true);
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setIsLoggedIn(true);
    setRoleResolved(false);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setIsVendor(false);
    setRoleResolved(true);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isVendor,
        roleResolved,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
