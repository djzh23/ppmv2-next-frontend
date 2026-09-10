"use client"

import { useRouter } from "next/navigation"
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
import { Building2, MapPin, Users, Phone, Pencil, PowerOff, Power, ArrowRight } from "lucide-react"

interface LocationCardProps {
  location: LocationDetail
  canEdit: boolean
  onEdit: (location: LocationDetail) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function LocationCard({ location, canEdit, onEdit, onDeactivate, onReactivate }: LocationCardProps) {
  const router = useRouter()

  const hasPhoto = !!location.photoUrl

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {/* Hero */}
      <div
        style={{
          height: "110px",
          flexShrink: 0,
          backgroundImage: hasPhoto ? `url(${location.photoUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          background: hasPhoto
            ? undefined
            : "linear-gradient(135deg, #38bdf8 0%, #2563eb 60%, #6d28d9 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {!hasPhoto && (
          <Building2 style={{ width: "36px", height: "36px", color: "rgba(255,255,255,0.75)" }} />
        )}
        {/* Aktiv/Inaktiv pill overlay */}
        <div style={{ position: "absolute", top: "8px", right: "8px" }}>
          {location.isActive ? (
            <Badge style={{ fontSize: "0.65rem", backgroundColor: "#166534", color: "#fff", border: "none" }}>
              Aktiv
            </Badge>
          ) : (
            <Badge variant="secondary" style={{ fontSize: "0.65rem" }}>
              Inaktiv
            </Badge>
          )}
        </div>
      </div>

      <CardHeader style={{ paddingBottom: "0.4rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3, color: "hsl(var(--foreground))" }}>
            {location.name}
          </span>
          <Badge variant="outline" style={{ fontSize: "0.68rem", flexShrink: 0 }}>
            {location.district}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 flex-1" style={{ paddingTop: 0 }}>
        {location.address && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span className="truncate">{location.address}</span>
          </div>
        )}
        {location.capacity != null && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span>{location.capacity} Plätze</span>
          </div>
        )}
        {location.contactPerson && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span className="truncate">{location.contactPerson}</span>
          </div>
        )}
      </CardContent>

      <CardFooter style={{ gap: "0.4rem", paddingTop: "0.75rem", flexWrap: "wrap" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/coordinator/locations/${location.id}`)}
          style={{ gap: "0.3rem", fontSize: "0.78rem", flex: 1 }}
        >
          <ArrowRight style={{ width: "12px", height: "12px" }} />
          Details
        </Button>

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(location)}
            style={{ gap: "0.3rem", fontSize: "0.78rem", flex: 1 }}
          >
            <Pencil style={{ width: "12px", height: "12px" }} />
            Bearbeiten
          </Button>
        )}

        {canEdit && location.isActive && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                style={{
                  gap: "0.3rem",
                  fontSize: "0.78rem",
                  flex: 1,
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
                  Die Unterkunft kann später reaktiviert werden.
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

        {canEdit && !location.isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReactivate(location.id)}
            style={{
              gap: "0.3rem",
              fontSize: "0.78rem",
              flex: 1,
              color: "#166534",
              borderColor: "rgba(22,101,52,0.3)",
            }}
          >
            <Power style={{ width: "12px", height: "12px" }} />
            Reaktivieren
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
