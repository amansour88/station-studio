/**
 * API Client for PHP Backend
 * 
 * This client handles all HTTP requests to the PHP API
 * with automatic session handling and error management.
 */

// Use API_URL from env or default to production API
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://aws.sa/api";

export class ApiRequestError extends Error {
  status?: number;
  url?: string;
  body?: unknown;

  constructor(message: string, opts: { status?: number; url?: string; body?: unknown } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = opts.status;
    this.url = opts.url;
    this.body = opts.body;
  }
}

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
async function handleResponse<T>(response: Response, url: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const raw = await response.text();

  let parsed: any = null;
  const looksJson =
    contentType.includes("application/json") ||
    raw.trim().startsWith("{") ||
    raw.trim().startsWith("[");

  if (raw && looksJson) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const msg =
      (parsed && (parsed.error || parsed.message)) ||
      raw ||
      `Request failed with status ${response.status}`;

    const err = new ApiRequestError(String(msg), {
      status: response.status,
      url,
      body: parsed ?? raw,
    });

    // Helpful debug: tells us whether this is CORS/network (no response) vs server validation.
    console.error("[API] Request failed", { status: response.status, url, body: err.body });
    throw err;
  }

  if (parsed !== null) return parsed as T;

  // Some endpoints may return empty bodies on success
  return {} as T;
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

    return handleResponse<T>(response, url);
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response, url);
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response, url);
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

    return handleResponse<T>(response, url);
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

    return handleResponse<{ url: string; success: boolean }>(response, url);
  },
};

// Export default for convenience
export default api;
