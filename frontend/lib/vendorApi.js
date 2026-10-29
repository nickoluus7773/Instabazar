import API_BASE_URL from "@/lib/api";

// PUBLIC VENDOR LIST
export const getPublicVendors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/public/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    return [];
  }
};


export const getVendorProfile = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/profile/`, {
      method: "GET",
      headers: {  
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      throw new Error(response.status === 401 ? "Unauthorized" : `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error?.message !== "Unauthorized" && !error?.message?.includes("401")) {
      console.error("Failed to fetch vendor profile:", error);
    }
    throw error;
  }
};

export const updateVendorProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/profile/update/`, {
      method: "PUT",
      headers: {
        ...(profileData instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
      },
      body: profileData instanceof FormData ? profileData : JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      const data = await response.json().catch(() => ({}));
      const firstErr =
        data.detail ||
        data.error ||
        (data.business_name && (Array.isArray(data.business_name) ? data.business_name[0] : data.business_name)) ||
        (data.profile_image && (Array.isArray(data.profile_image) ? data.profile_image[0] : data.profile_image)) ||
        (data.instagram_handle && (Array.isArray(data.instagram_handle) ? data.instagram_handle[0] : data.instagram_handle)) ||
        (typeof data === "object" ? Object.values(data).flat()[0] : null) ||
        `Error: ${response.status}`;
      throw new Error(firstErr);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update vendor profile:", error);
    throw error;
  }
};

export const getVendorStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/stats/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      throw new Error(response.status === 401 ? "Unauthorized" : `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error?.message !== "Unauthorized" && !error?.message?.includes("401")) {
      console.error("Failed to fetch vendor stats:", error);
    }
    throw error;
  }
};

export const getVendorWishlistAnalysis = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/wishlist-analysis/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(response.status === 401 ? "Unauthorized" : `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch wishlist analysis:", error);
    throw error;
  }
};

export const getVendorAnalysis = async (token, period = "30") => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/analysis/?period=${period}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(response.status === 401 ? "Unauthorized" : `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch vendor analysis:", error);
    throw error;
  }
};

export const cancelSubscription = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions/cancel/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.message || `Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    throw error;
  }
};

export const getVendorProducts = async (token, page = 1, pageSize = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/vendor/products/?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error?.message !== "Unauthorized" && !error?.message?.includes("401")) {
      console.error("Failed to fetch vendor products:", error);
    }
    throw error;
  }
};


export async function createProduct(token, productData) {
  const isFormData =
    typeof FormData !== "undefined" && productData instanceof FormData;

  const response = await fetch(`${API_BASE_URL}/api/vendor/products/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? productData : JSON.stringify(productData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message ||
        data.detail ||
        data.error ||
        data.instagram_post_url?.[0] ||
        `Failed to create product (${response.status}).`
    );

    error.status = response.status;
    error.code = data.code;
    error.product_limit = data.product_limit;
    error.upgrade_required = data.upgrade_required;

    throw error;
  }

  return data;
}


export const updateProduct = async (token, productId, productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/products/${productId}/`, {
      method: "PUT",
      headers: {
        ...(productData instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
      },
      body: productData instanceof FormData ? productData : JSON.stringify(productData),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const rawPostErr = data.instagram_post_url;
      const postUrlMsg = Array.isArray(rawPostErr) ? rawPostErr[0] : (typeof rawPostErr === "string" ? rawPostErr : null);
      const errMsg =
        postUrlMsg ||
        data.detail ||
        data.error ||
        (data.title && (Array.isArray(data.title) ? data.title[0] : data.title)) ||
        (data.productImage && (Array.isArray(data.productImage) ? data.productImage[0] : data.productImage)) ||
        (data.price && (Array.isArray(data.price) ? data.price[0] : data.price)) ||
        (typeof data === "object" ? Object.values(data).flat()[0] : null) ||
        `Error: ${response.status}`;
      throw new Error(errMsg);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

export const deleteProduct = async (token, productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/products/${productId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      throw new Error(`Error: ${response.status}`);
    }

    return response.ok;
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
};
export const getPublicVendorBySlug = async (slug) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const response = await fetch(`${API_BASE_URL}/api/vendor/public/${slug}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch vendor detail:", error);
    throw error;
  }
};
