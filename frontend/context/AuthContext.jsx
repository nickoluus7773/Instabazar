"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));
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
      return () => {
        cancelled = true;
      };
    }

    fetch(`${API_BASE_URL}/api/vendor/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!cancelled) {
          setIsVendor(response.ok);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsVendor(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setIsVendor(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isVendor,
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
