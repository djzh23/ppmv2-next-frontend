export type UserRoleName = "Admin" | "Coordinator" | "Festmitarbeiter" | "Honorarkraft"
export type UserRoleValue = UserRoleName

export type ShiftStatus = "Draft" | "PendingApproval" | "Planned" | "Active" | "Completed" | "Cancelled"
export type ConfirmationStatus = "Invited" | "Accepted" | "Declined"

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
  description?: string
  photoUrl?: string
  contactPerson?: string
  capacity?: number
}

export interface LocationDetail extends Location {
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateLocationRequest {
  name: string
  district: string
  address?: string
  description?: string
  photoUrl?: string
  contactPerson?: string
  capacity?: number
  notes?: string
}

export type UpdateLocationRequest = CreateLocationRequest

// Returned by GET /api/shifts (list) — lighter than ShiftDetails
export interface ShiftSummary {
  id: string
  title: string
  status: ShiftStatus
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
  confirmationStatus?: ConfirmationStatus
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
  status: ShiftStatus
  readiness?: "ready" | "not_ready"
  missingRequirements?: string[]
}

export interface AvailableStaff {
  userId: string
  firstname: string
  lastname: string
  role: UserRoleName
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
