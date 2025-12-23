import { Badge } from "@/components/ui/badge"

interface RoleBadgeProps {
  role: 0 | 1 | 2 // 0: Leader, 1: Member, 2: Support
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleData = {
    0: { label: "Leader", className: "bg-blue-100 text-blue-800 border-blue-200" },
    1: { label: "Member", className: "bg-green-100 text-green-800 border-green-200" },
    2: { label: "Support", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  }

  const { label, className } = roleData[role]

  return <Badge className={className}>{label}</Badge>
}