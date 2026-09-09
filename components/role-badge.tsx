import { Badge } from "@/components/ui/badge"
import type { ParticipantRole } from "@/lib/types"

interface RoleBadgeProps {
  role: ParticipantRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleData: Record<ParticipantRole, { label: string; className: string }> = {
    Leader: { label: "Leader", className: "bg-blue-100 text-blue-800 border-blue-200" },
    Member: { label: "Member", className: "bg-green-100 text-green-800 border-green-200" },
    Support: { label: "Support", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  }

  const { label, className } = roleData[role]

  return <Badge className={className}>{label}</Badge>
}