import { Badge } from "@/components/ui/badge"
import type { ShiftStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: ShiftStatus
}

const labels: Record<ShiftStatus, string> = {
  Draft: "Entwurf",
  PendingApproval: "Zur Genehmigung",
  Planned: "Geplant",
  Active: "Aktiv",
  Completed: "Abgeschlossen",
  Cancelled: "Storniert",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "PendingApproval") {
    return (
      <Badge style={{ backgroundColor: "#f59e0b", color: "#fff", border: "none" }}>
        {labels[status]}
      </Badge>
    )
  }

  const variants: Partial<Record<ShiftStatus, "secondary" | "default" | "outline" | "destructive">> = {
    Draft: "secondary",
    Planned: "default",
    Active: "outline",
    Completed: "secondary",
    Cancelled: "destructive",
  }

  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}
