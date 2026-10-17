import API_BASE_URL from "@/lib/api";

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/vendor/${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export const getCustomerFollows = (token) => request("follows/", token);
export const followVendor = (token, vendorId) => request("follows/", token, {
  method: "POST",
  body: JSON.stringify({ vendor_id: vendorId }),
});
export const unfollowVendor = (token, vendorId) => request(`follows/${vendorId}/`, token, { method: "DELETE" });
export const getPersonalFeed = (token, page = 1) => request(`feed/?page=${page}`, token);
export const getVendorFollowers = (token, page = 1) => request(`followers/?page=${page}`, token);
