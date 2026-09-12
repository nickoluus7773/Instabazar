"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import API_BASE_URL from "@/lib/api";

const FavoritesContext = createContext(undefined);

export function FavoritesProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    if (!isLoggedIn) {
      const timer = window.setTimeout(() => setFavoriteProducts([]), 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return undefined;

    fetch(`${API_BASE_URL}/api/wishlist/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((products) => {
        if (!cancelled && Array.isArray(products)) setFavoriteProducts(products);
      })
      .catch(() => {
        if (!cancelled) setFavoriteProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  async function toggleFavorite(product) {
    const token = localStorage.getItem("accessToken");
    if (!token || !product?.id) return;

    const alreadySaved = favoriteProducts.some((item) => item.id === product.id);
    const previousProducts = favoriteProducts;
    setFavoriteProducts((current) =>
      alreadySaved
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]
    );

    try {
      const response = await fetch(
        alreadySaved
          ? `${API_BASE_URL}/api/wishlist/${product.id}/`
          : `${API_BASE_URL}/api/wishlist/`,
        {
          method: alreadySaved ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(alreadySaved ? {} : { "Content-Type": "application/json" }),
          },
          ...(alreadySaved ? {} : { body: JSON.stringify({ product_id: product.id }) }),
        }
      );

      if (!response.ok) throw new Error("Wishlist update failed");
    } catch {
      setFavoriteProducts(previousProducts);
    }
  }

  function isFavorite(productId) {
    return favoriteProducts.some((product) => product.id === productId);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites: favoriteProducts.map((product) => product.id),
        favoriteProducts,
        toggleFavorite,
        isFavorite,
      }}
    >
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
