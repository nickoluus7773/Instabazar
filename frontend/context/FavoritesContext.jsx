"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(undefined);

const STORAGE_KEY = "instabazaar:favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Load once on mount (client only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const timer = window.setTimeout(() => setFavorites(JSON.parse(raw)), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore write errors (e.g. private mode)
    }
  }, [favorites]);

  function toggleFavorite(slug) {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function isFavorite(slug) {
    return favorites.includes(slug);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
