// API configuration and service layer
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Token management
export const getToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// API client with automatic token handling
async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTokens(data.accessToken, data.refreshToken);
        // Retry original request
        headers['Authorization'] = `Bearer ${data.accessToken}`;
        return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
      } else {
        clearTokens();
        window.location.href = '/login';
      }
    }
  }

  return response;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  logout: async () => {
    const response = await apiClient('/auth/logout', { method: 'POST' });
    clearTokens();
    return response.json();
  },
  register: async (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    const response = await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Generic CRUD operations
export const createCRUD = (resource: string) => ({
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const response = await apiClient(`/${resource}${query}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || 'Failed to fetch data');
    }
    return response.json();
  },
  getById: async (id: number | string) => {
    const response = await apiClient(`/${resource}/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `Failed to fetch ${resource}`);
    }
    return response.json();
  },
  create: async (data: any) => {
    const response = await apiClient(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `Failed to create ${resource}`);
    }
    return response.json();
  },
  update: async (id: number | string, data: any) => {
    const response = await apiClient(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `Failed to update ${resource}`);
    }
    return response.json();
  },
  delete: async (id: number | string) => {
    const response = await apiClient(`/${resource}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `Failed to delete ${resource}`);
    }
    return response.json();
  },
});

// Resource-specific APIs
//export const patientsAPI = createCRUD('patients');
export const patientsAPI = {
  // Fetch all patients
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/patients`);
    if (!res.ok) throw new Error("Failed to fetch patients");
    return res.json();
  },

  // Fetch a single patient by ID
  getById: async (id: number | string) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch patient with id ${id}`);
    return res.json();
  },

  // Create a new patient
  create: async (patientData: any) => {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) throw new Error("Failed to create patient");
    return res.json();
  },

  // Update patient details
  update: async (id: number | string, patientData: any) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) throw new Error(`Failed to update patient with id ${id}`);
    return res.json();
  },

  // Delete a patient record
  delete: async (id: number | string) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete patient with id ${id}`);
    return res.json();
  },
};

export const dashboardAPI = {
  getMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard`);
    if (!res.ok) throw new Error("Failed to fetch metrics");
    return res.json();
  },
  getVisitsByTrial: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/visits-by-trial`);
    if (!res.ok) throw new Error("Failed to fetch visits by trial");
    return res.json();
  },
  getEnrollmentsTrend: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/enrollments-trend`);
    if (!res.ok) throw new Error("Failed to fetch enrollment trend");
    return res.json();
  },
};


export const patientHistoryAPI = {
  getHistory: async (patientId: number) => {
    const res = await fetch(`${API_BASE_URL}/patient-history/${patientId}`);
    if (!res.ok) throw new Error("Failed to fetch patient history");
    return res.json();
  },
};



//export const trialsAPI = createCRUD('trials');
export const enrollmentsAPI = createCRUD('enrollments');
export const visitsAPI = createCRUD('visits');

export const measurementsAPI = createCRUD('measurements');
export const medicationsAPI = createCRUD('medications');
export const dispensesAPI = createCRUD('dispenses');
export const outcomesAPI = createCRUD('outcomes');
export const staffAPI = {
  getAll: async () => fetch(`http://localhost:3000/api/staffandsites/staff`).then(r => r.json()),
};

export const sitesAPI = {
  getAll: async () => fetch(`http://localhost:3000/api/staffandsites/sites`).then(r => r.json()),
};

export const sponsorsAPI = {
  getAll: async () => fetch(`http://localhost:3000/api/staffandsites/sponsors`).then(r => r.json()),
};

export const contactsAPI = createCRUD('contacts');

// Analytics API
export const analyticsAPI = {
  getPatientHistory: async (patientId: number) => {
    const response = await apiClient(`/analytics/patient-history/${patientId}`);
    return response.json();
  },
  getBaselineSummary: async (trialId?: number, metric?: string) => {
    const params = new URLSearchParams();
    if (trialId) params.append('trialId', trialId.toString());
    if (metric) params.append('metric', metric);
    const response = await apiClient(`/analytics/baseline-summary?${params}`);
    return response.json();
  },
  getResponseRate: async (trialId?: number) => {
    const params = trialId ? `?trialId=${trialId}` : '';
    const response = await apiClient(`/analytics/response-rate${params}`);
    return response.json();
  },
  getEnrollmentTrends: async (trialId?: number, start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (trialId) params.append('trialId', trialId.toString());
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const response = await apiClient(`/analytics/enrollment-trends?${params}`);
    return response.json();
  },
};

export const trialsAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/trials`);
    if (!res.ok) throw new Error("Failed to fetch trials");
    return res.json();
  },

  getById: async (id: number | string) => {
    const res = await fetch(`${API_BASE_URL}/trials/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch trial with id ${id}`);
    return res.json();
  },

  create: async (trialData: any) => {
    const res = await fetch(`${API_BASE_URL}/trials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trialData),
    });
    if (!res.ok) throw new Error("Failed to create trial");
    return res.json();
  },

  update: async (id: number | string, trialData: any) => {
    try {
      console.log('Updating trial:', { id, data: trialData }); // Debug log
      const res = await fetch(`${API_BASE_URL}/trials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trialData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update trial");
      }
      return res.json();
    } catch (error) {
      console.error('Trial update error:', error);
      throw error;
    }
  },

  delete: async (id: number | string) => {
    const res = await fetch(`${API_BASE_URL}/trials/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete trial");
    return res.json();
  },
};
