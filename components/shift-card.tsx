"use client"

import type { ShiftSummary } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"

interface ShiftCardProps {
  shift: ShiftSummary
  onView?: (id: string) => void
}

export function ShiftCard({ shift, onView }: ShiftCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{shift.title}</CardTitle>
          <StatusBadge status={shift.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 shrink-0" />
          <span>
            {format(new Date(shift.startAtUtc), "dd.MM.yyyy HH:mm")} – {format(new Date(shift.endAtUtc), "HH:mm")}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 shrink-0" />
          <span>{shift.location.name}, {shift.location.district}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 shrink-0" />
          <span>{shift.participantCount} Teilnehmer</span>
        </div>
      </CardContent>
      {onView && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => onView(shift.id)} className="w-full">
            Details anzeigen
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
