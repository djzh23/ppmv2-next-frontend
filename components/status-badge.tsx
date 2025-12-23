import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "Draft" | "Planned" | "Active"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    Draft: "secondary" as const,
    Planned: "default" as const,
    Active: "outline" as const,
  }

  return <Badge variant={variants[status]}>{status}</Badge>
}
