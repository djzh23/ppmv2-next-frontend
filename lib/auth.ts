import type { AuthResponse } from "./types"
import { apiPost } from "./apiClient"

export function decodeJwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export function getAuthUser(): AuthResponse | null {
  if (typeof window === "undefined") return null
  const userJson = localStorage.getItem("authUser")
  return userJson ? JSON.parse(userJson) : null
}

export function getUserRole(): string | null {
  const user = getAuthUser()
  if (user?.role) return user.role

  const token = getAuthToken()
  if (token) return decodeJwtRole(token)

  return null
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/api/auth/login", {
    email,
    password,
  })

  // If role not in response, try to decode from JWT
  if (!response.role && response.token) {
    const roleFromToken = decodeJwtRole(response.token)
    if (roleFromToken) {
      response.role = roleFromToken as AuthResponse["role"]
    }
  }

  localStorage.setItem("authToken", response.token)
  localStorage.setItem("refreshToken", response.refreshToken)
  localStorage.setItem("authUser", JSON.stringify(response))

  return response
}

export async function register(firstname: string, lastname: string, email: string, password: string): Promise<void> {
  await apiPost("/api/auth/register", {
    firstname,
    lastname,
    email,
    password,
  })
}

export function logout(): void {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
  if (refreshToken) {
    // Fire-and-forget: revoke token server-side, don't block local logout on network errors
    apiPost("/api/auth/logout", { refreshToken }).catch(() => {})
  }
  localStorage.removeItem("authToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("authUser")
  window.location.href = "/auth/login"
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export function hasRole(allowedRoles: string[]): boolean {
  const role = getUserRole()
  return role ? allowedRoles.includes(role) : false
}
