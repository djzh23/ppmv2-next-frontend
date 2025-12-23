export type UserRoleName = "Admin" | "Coordinator" | "Festmitarbeiter" | "Honorarkraft"
export type UserRoleValue = UserRoleName | number | `${number}`

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
  status?: "pending" | "approved" | "rejected"
}

export interface Location {
  id: string
  name: string
  address?: string
}

export enum ParticipantRole {
  Leader = 0,
  Member = 1,
  Support = 2,
}

export interface EinsatzParticipant {
  userId: string
  role: ParticipantRole
  user?: User
}

export interface EinsatzDetails {
  id: string
  title: string
  description: string
  startAtUtc: string
  endAtUtc: string
  locationId: string
  location?: Location
  participants: EinsatzParticipant[]
  status: "Draft" | "Planned" | "Active"
  readiness?: "ready" | "not_ready"
  missingRequirements?: string[]
}

export interface CreateEinsatzRequest {
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
