import type { UserRoleName, UserRoleValue } from "@/lib/types"

export const RoleIdToName: Record<number, UserRoleName> = {
  1: "Admin",
  2: "Coordinator",
  3: "Festmitarbeiter",
  4: "Honorarkraft",
}

const RoleNameSet = new Set<UserRoleName>([
  "Admin",
  "Coordinator",
  "Festmitarbeiter",
  "Honorarkraft",
])

export function roleToName(role: UserRoleValue | undefined | null): string {
  if (role === undefined || role === null) return "—"

  // already a known name
  if (typeof role === "string" && RoleNameSet.has(role as UserRoleName)) return role

  // numeric string -> number
  if (typeof role === "string") {
    const trimmed = role.trim()
    if (!trimmed) return "—"
    const asNumber = Number(trimmed)
    if (!Number.isNaN(asNumber)) return RoleIdToName[asNumber] ?? `Role ${trimmed}`
    return trimmed
  }

  // number
  if (typeof role === "number") return RoleIdToName[role] ?? `Role ${role}`

  return "—"
}
