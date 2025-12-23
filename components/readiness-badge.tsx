import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface ReadinessBadgeProps {
  readiness?: "ready" | "not_ready"
}

export function ReadinessBadge({ readiness }: ReadinessBadgeProps) {
  if (!readiness) return null

  if (readiness === "ready") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Ready
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
      <AlertCircle className="h-3 w-3 mr-1" />
      Not Ready
    </Badge>
  )
}
