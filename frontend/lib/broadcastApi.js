import API_BASE_URL from "@/lib/api";

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/broadcasts/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || Object.values(data).flat()[0] || `Request failed (${response.status})`);
  return data;
}

export const getBroadcasts = (token) => request("", token);
export const getBroadcastEligibility = (token) => request("eligibility/", token);
export const getBroadcastAnalytics = (token) => request("analytics/", token);
export const getBroadcastProducts = (token) => request("products/", token);
export const createBroadcast = (token, body) => request("", token, { method: "POST", body });
export const updateBroadcast = (token, id, body) => request(`${id}/`, token, { method: "PATCH", body: JSON.stringify(body) });
export const publishBroadcast = (token, id) => request(`${id}/publish/`, token, { method: "POST", body: JSON.stringify({}) });
export const deleteBroadcast = (token, id) => request(`${id}/`, token, { method: "DELETE" });
export const archiveBroadcast = (token, id) => request(`${id}/archive/`, token, { method: "POST", body: JSON.stringify({}) });
export const getCustomerBroadcasts = (token) => request("feed/", token);
export const getBroadcastNotifications = (token) => request("notifications/", token);
export const markBroadcastRead = (token, id) => request(`${id}/read/`, token, { method: "POST", body: JSON.stringify({}) });
export const trackBroadcastClick = (token, id, click_type) => request(`${id}/click/`, token, { method: "POST", body: JSON.stringify({ click_type }) });
