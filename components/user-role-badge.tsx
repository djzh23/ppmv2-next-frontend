import { Badge } from "@/components/ui/badge"
import type { UserRoleName } from "@/lib/types"
import { roleToName } from "@/lib/roles"

interface UserRoleBadgeProps {
  role: string | number | undefined | null
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const roleName = roleToName(role) as UserRoleName | "—"

  if (!roleName || roleName === "—") {
    return <span className="text-muted-foreground text-sm">Not assigned</span>
  }

  const roleData: Record<UserRoleName, { label: string; className: string }> = {
    Admin: { label: "Admin", className: "bg-red-100 text-red-800 border-red-200" },
    Coordinator: { label: "Coordinator", className: "bg-blue-100 text-blue-800 border-blue-200" },
    Festmitarbeiter: { label: "Festmitarbeiter", className: "bg-green-100 text-green-800 border-green-200" },
    Honorarkraft: { label: "Honorarkraft", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  }

  const { label, className } = roleData[roleName]

  return <Badge className={className}>{label}</Badge>
}