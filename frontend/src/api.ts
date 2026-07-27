const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8005" : "");

// Helper to get Auth Token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("rivernet_token");
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("rivernet_token", token);
  } else {
    localStorage.removeItem("rivernet_token");
  }
};

export const logout = () => {
  setAuthToken(null);
  localStorage.removeItem("rivernet_user");
};

// Generic request wrapper
async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "Request failed";
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.access_token);
    localStorage.setItem("rivernet_user", JSON.stringify({ email }));
    return res;
  },
  
  async register(email: string, password: string) {
    const res = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.access_token);
    localStorage.setItem("rivernet_user", JSON.stringify({ email }));
    return res;
  },

  // Settings
  async getSettings() {
    return apiRequest("/api/settings");
  },

  async saveSettings(settings: any) {
    return apiRequest("/api/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  // Leads
  async searchLeads(searchParams: { country: string; city: string; industry: string; category?: string; metro_expansion?: boolean }) {
    return apiRequest("/api/leads/search", {
      method: "POST",
      body: JSON.stringify(searchParams),
    });
  },

  async listLeads(filters: {
    crm_status?: string;
    lead_status?: string;
    category?: string;
    has_website?: boolean;
    min_rating?: number;
    min_score?: number;
    search_query?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, String(val));
      }
    });
    return apiRequest(`/api/leads?${params.toString()}`);
  },

  async getLead(id: number) {
    return apiRequest(`/api/leads/${id}`);
  },

  async updateLead(id: number, data: { 
    crm_status?: string; 
    crm_notes?: string; 
    reminder_date?: string;
    setup_price?: number;
    suggested_monthly_budget?: number;
    recommended_website_package?: string;
    estimated_services?: string[];
    lead_score?: number;
    lead_status?: string;
  }) {
    return apiRequest(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteLead(id: number, password?: string) {
    const url = password ? `/api/leads/${id}?password=${encodeURIComponent(password)}` : `/api/leads/${id}`;
    return apiRequest(url, {
      method: "DELETE",
    });
  },

  async toggleFavorite(id: number) {
    return apiRequest(`/api/leads/${id}/favorite`, {
      method: "PATCH",
    });
  },

  async bulkUpdateCRM(leadIds: number[], crmStatus: string) {
    return apiRequest("/api/leads/bulk-crm", {
      method: "POST",
      body: JSON.stringify({ lead_ids: leadIds, crm_status: crmStatus }),
    });
  },

  async bulkDeleteLeads(leadIds: number[]) {
    return apiRequest("/api/leads/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ lead_ids: leadIds }),
    });
  },

  // Dashboard Stats
  async getStats() {
    return apiRequest("/api/dashboard/stats");
  },

  // Get Export URL
  getExportUrl(format: string, filters: { crm_status?: string; lead_status?: string } = {}) {
    const params = new URLSearchParams();
    params.append("format", format);
    if (filters.crm_status) params.append("crm_status", filters.crm_status);
    if (filters.lead_status) params.append("lead_status", filters.lead_status);
    return `${API_BASE_URL}/api/export/leads?${params.toString()}`;
  },

  // AI Reports & Meeting Prep
  async getLeadReport(id: number) {
    return apiRequest(`/api/leads/${id}/report`);
  },

  async regenerateLeadReport(id: number) {
    return apiRequest(`/api/leads/${id}/report/regenerate`, { method: "POST" });
  },

  async getMeetingBrief(id: number) {
    return apiRequest(`/api/leads/${id}/meeting-brief`);
  },

  async regenerateMeetingBrief(id: number) {
    return apiRequest(`/api/leads/${id}/meeting-brief/regenerate`, { method: "POST" });
  },

  async getSimilarLeads(id: number) {
    return apiRequest(`/api/leads/${id}/similar`);
  },

  // Public unauthenticated queries
  async getPublicLeadReport(token: string) {
    const res = await fetch(`${API_BASE_URL}/api/public/report/${token}`);
    if (!res.ok) {
      const txt = await res.text();
      try {
        const json = JSON.parse(txt);
        throw new Error(json.detail || "Failed to load public report");
      } catch {
        throw new Error(txt || "Failed to load public report");
      }
    }
    return res.json();
  },

  async getPublicMeetingBrief(token: string) {
    const res = await fetch(`${API_BASE_URL}/api/public/meeting-brief/${token}`);
    if (!res.ok) {
      const txt = await res.text();
      try {
        const json = JSON.parse(txt);
        throw new Error(json.detail || "Failed to load public brief");
      } catch {
        throw new Error(txt || "Failed to load public brief");
      }
    }
    return res.json();
  },

  async resetDatabase(password: string) {
    return apiRequest("/api/settings/reset-database", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }
};
