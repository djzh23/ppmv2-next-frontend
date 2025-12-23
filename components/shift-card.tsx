"use client"

import type { ShiftDetails } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { ReadinessBadge } from "@/components/readiness-badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"

interface ShiftCardProps {
  shift: ShiftDetails
  onView?: (id: string) => void
  showActions?: boolean
}

export function ShiftCard({ shift: shift, onView, showActions = true }: ShiftCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{shift.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{shift.description}</CardDescription>
          </div>
          <div className="flex gap-2 ml-4">
            <StatusBadge status={shift.status} />
            <ReadinessBadge readiness={shift.readiness} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {format(new Date(shift.startAtUtc), "PPp")} - {format(new Date(shift.endAtUtc), "p")}
          </span>
        </div>
        {shift.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{shift.location.name}</span>
          </div>
        )}
      </CardContent>
      {showActions && onView && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => onView(shift.id)} className="w-full">
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
