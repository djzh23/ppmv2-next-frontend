"use client"

import type { LocationDetail } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Building2, MapPin, Users, Phone, Pencil, PowerOff } from "lucide-react"

interface LocationCardProps {
  location: LocationDetail
  onEdit: (location: LocationDetail) => void
  onDeactivate: (id: string) => void
}

export function LocationCard({ location, onEdit, onDeactivate }: LocationCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow flex flex-col"
      style={{ opacity: location.isActive ? 1 : 0.55 }}
    >
      {/* Placeholder image area */}
      <div
        style={{
          height: "100px",
          borderRadius: "var(--radius) var(--radius) 0 0",
          background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 60%, #6d28d9 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Building2 style={{ width: "36px", height: "36px", color: "rgba(255,255,255,0.75)" }} />
      </div>

      <CardHeader style={{ paddingBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3, color: "hsl(var(--foreground))" }}>
            {location.name}
          </span>
          <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
            {!location.isActive && (
              <Badge variant="secondary" style={{ fontSize: "0.68rem" }}>
                Inaktiv
              </Badge>
            )}
            <Badge variant="outline" style={{ fontSize: "0.68rem" }}>
              {location.district}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 flex-1" style={{ paddingTop: 0 }}>
        {location.address && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span>{location.address}</span>
          </div>
        )}
        {location.capacity != null && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span>Kapazität: {location.capacity}</span>
          </div>
        )}
        {location.contactPerson && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span>{location.contactPerson}</span>
          </div>
        )}
      </CardContent>

      <CardFooter style={{ gap: "0.5rem", paddingTop: "0.75rem" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(location)}
          style={{ flex: 1, gap: "0.35rem", fontSize: "0.8rem" }}
        >
          <Pencil style={{ width: "12px", height: "12px" }} />
          Bearbeiten
        </Button>

        {location.isActive && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                style={{
                  flex: 1,
                  gap: "0.35rem",
                  fontSize: "0.8rem",
                  color: "hsl(var(--destructive))",
                  borderColor: "hsl(var(--destructive) / 0.3)",
                }}
              >
                <PowerOff style={{ width: "12px", height: "12px" }} />
                Deaktivieren
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unterkunft deaktivieren?</AlertDialogTitle>
                <AlertDialogDescription>
                  „{location.name}" wird deaktiviert und steht für neue Einsätze nicht mehr zur Verfügung.
                  Diese Aktion kann rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeactivate(location.id)}
                  style={{ backgroundColor: "hsl(var(--destructive))", color: "white" }}
                >
                  Deaktivieren
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  )
}
