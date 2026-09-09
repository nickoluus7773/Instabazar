import API_BASE_URL from "@/lib/api";

// PUBLIC VENDOR LIST
export const getPublicVendors = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/vendor/public/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch vendors: ${response.status}`
      );
    }

    return await response.json();

  } catch (error) {
    console.error(
      "Failed to fetch public vendors:",  
      error
    );

    throw error;
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
      throw new Error(response.status === 401 ? "Unauthorized" : `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch vendor profile:", error);
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
      throw new Error(`Error: ${response.status}`);
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
      throw new Error(response.status === 401 ? "Unauthorized" : `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch vendor stats:", error);
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
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch vendor products:", error);
    throw error;
  }
};

export const createProduct = async (token, productData) => {
  try {
    const isFormData = typeof FormData !== "undefined" && productData instanceof FormData;
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    };

    const response = await fetch(`${API_BASE_URL}/api/vendor/products/`, {
      method: "POST",
      headers,
      body: isFormData ? productData : JSON.stringify(productData),
    });

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch {}
      throw new Error(errData.error || errData.detail || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
};

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
      throw new Error(`Error: ${response.status}`);
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
    const response = await fetch(`${API_BASE_URL}/api/vendor/public/${slug}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch vendor detail:", error);
    throw error;
  }
};
