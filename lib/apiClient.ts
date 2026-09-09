const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Add it to your .env.local file.")
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function isBrowser() {
  return typeof window !== "undefined"
}

/**
 * Reads the response body safely:
 * - returns null for empty bodies / 204
 * - returns parsed JSON if possible
 * - otherwise returns raw text
 */
async function readBodySafe(response: Response): Promise<unknown> {
  // No content
  if (response.status === 204 || response.status === 205) return null

  const text = await response.text()
  if (!text) return null

  // Try JSON parse; if it fails, return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Tries to extract a meaningful error message from typical API error formats:
 * - string
 * - { message: string }
 * - { title: string } (ASP.NET problem details)
 * - { errors: {...} }
 */
function extractErrorMessage(data: unknown, fallback: string) {
  if (!data) return fallback
  if (typeof data === "string") return data

  if (typeof data === "object") {
    const anyData = data as any
    if (typeof anyData.message === "string" && anyData.message.trim()) return anyData.message
    if (typeof anyData.title === "string" && anyData.title.trim()) return anyData.title

    // ASP.NET validation problem details often have: { title, status, errors: { Field: [..] } }
    if (anyData.errors && typeof anyData.errors === "object") {
      const firstKey = Object.keys(anyData.errors)[0]
      const firstVal = firstKey ? anyData.errors[firstKey] : null
      if (Array.isArray(firstVal) && firstVal.length > 0) return String(firstVal[0])
      if (typeof firstVal === "string") return firstVal
      return "Validation failed"
    }
  }

  return fallback
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = isBrowser() ? localStorage.getItem("authToken") : null

  const headers = new Headers(options.headers)

  // Only set content-type if we actually send JSON.
  // This avoids problems if later you want to send FormData, etc.
  const method = (options.method || "GET").toUpperCase()
  const hasBody = options.body !== undefined && options.body !== null
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      mode: "cors",
    })

    if (response.status === 401) {
      if (isBrowser()) {
        localStorage.removeItem("authToken")
        localStorage.removeItem("authUser")
        window.location.href = "/auth/login"
      }
      throw new ApiError(401, "Unauthorized")
    }

    return response
  } catch (error) {
    // Handle CORS and network errors
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      console.error("[api] CORS or Network Error:", {
        endpoint,
        baseUrl: API_BASE_URL,
        error: error.message,
        origin: isBrowser() ? window.location.origin : "server",
        hint: "Check if backend CORS allows this origin",
      })

      throw new ApiError(
        0,
        `Cannot connect to backend at ${API_BASE_URL}. The backend may be down or CORS is not configured to allow requests from ${
          isBrowser() ? window.location.origin : "this origin"
        }.`,
      )
    }
    throw error
  }
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options)

  const data = await readBodySafe(response)

  if (!response.ok) {
    const message = extractErrorMessage(data, "Request failed")
    throw new ApiError(response.status, message, data)
  }

  // If server returns no body, return null/{} depending on expected type.
  return (data ?? ({} as T)) as T
}

export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return requestJson<T>(endpoint, { ...(options ?? {}), method: "GET" })
}

export async function apiPost<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
  return requestJson<T>(endpoint, {
    ...(options ?? {}),
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })
}

export async function apiPut<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
  return requestJson<T>(endpoint, {
    ...(options ?? {}),
    method: "PUT",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })
}

export async function apiDelete<T = void>(endpoint: string, options?: RequestInit): Promise<T> {
  return requestJson<T>(endpoint, { ...(options ?? {}), method: "DELETE" })
}
