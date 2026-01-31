/**
 * API Client for PHP Backend
 * 
 * This client handles all HTTP requests to the PHP API
 * with automatic session handling and error management.
 */

// Use API_URL from env or default to production API
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://aws.sa/api";

export interface ApiError {
  error: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

/**
 * Parse response and handle errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  
  if (!contentType || !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * API Client object with methods for all HTTP operations
 */
export const api = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
    });

    return handleResponse<T>(response);
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
    });

    return handleResponse<T>(response);
  },

  /**
   * Upload file
   */
  async upload(endpoint: string, file: File, folder?: string): Promise<{ url: string; success: boolean }> {
    const formData = new FormData();
    formData.append("file", file);

    let url = `${API_BASE_URL}${endpoint}`;
    if (folder) {
      url += `?folder=${encodeURIComponent(folder)}`;
    }

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return handleResponse<{ url: string; success: boolean }>(response);
  },
};

// Export default for convenience
export default api;
