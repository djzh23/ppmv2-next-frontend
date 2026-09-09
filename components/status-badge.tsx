import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "Draft" | "Planned" | "Active" | "Completed" | "Cancelled"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<StatusBadgeProps["status"], "secondary" | "default" | "outline" | "destructive"> = {
    Draft: "secondary",
    Planned: "default",
    Active: "outline",
    Completed: "secondary",
    Cancelled: "destructive",
  }

  return <Badge variant={variants[status]}>{status}</Badge>
}
