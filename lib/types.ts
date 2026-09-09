export type UserRoleName = "Admin" | "Coordinator" | "Festmitarbeiter" | "Honorarkraft"
export type UserRoleValue = UserRoleName

export interface AuthResponse {
  token: string
  userId: string
  email: string
  role?: UserRoleName
}

export interface User {
  id: string
  firstname: string
  lastname: string
  email: string

  // Backend may send: 1, "1", or "Admin"
  role?: UserRoleValue

  // optional future-proof
  roleId?: number

  createdAt?: string
  status?: "Pending" | "Approved" | "Rejected" | "Deactivated"
}

export interface Location {
  id: string
  name: string
  district: string
  address?: string
}

// Returned by GET /api/shifts (list) — lighter than ShiftDetails
export interface ShiftSummary {
  id: string
  title: string
  status: "Draft" | "Planned" | "Active" | "Completed" | "Cancelled"
  startAtUtc: string
  endAtUtc: string
  location: Location
  participantCount: number
}

export const ParticipantRole = {
  Leader: "Leader",
  Member: "Member",
  Support: "Support",
} as const

export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole]

export interface ShiftParticipant {
  userId: string
  role: ParticipantRole
  // Backend may embed user data flat on the participant or nested under `user`
  firstname?: string
  lastname?: string
  user?: User
}

export function participantDisplayName(p: ShiftParticipant): string {
  if (p.firstname || p.lastname) return `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim()
  if (p.user?.firstname || p.user?.lastname) return `${p.user.firstname ?? ""} ${p.user.lastname ?? ""}`.trim()
  return p.userId.slice(0, 8)
}

export interface ShiftDetails {
  id: string
  title: string
  description: string
  startAtUtc: string
  endAtUtc: string
  locationId: string
  location?: Location
  participants: ShiftParticipant[]
  status: "Draft" | "Planned" | "Active" | "Completed" | "Cancelled"
  readiness?: "ready" | "not_ready"
  missingRequirements?: string[]
}

// Returned by GET /api/users/me
export interface UserProfile {
  id: string
  firstname: string
  lastname: string
  email: string
  role: UserRoleName
  status: "Pending" | "Approved" | "Rejected" | "Deactivated"
}

export interface CreateShiftRequest {
  title: string
  description: string
  startAtUtc: string
  endAtUtc: string
  locationId: string
  participants: {
    userId: string
    role: ParticipantRole
  }[]
}
