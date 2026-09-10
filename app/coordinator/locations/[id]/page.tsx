"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { LocationFormDialog } from "@/components/location-form-dialog"
import { apiGet } from "@/lib/apiClient"
import type { LocationDetail, AvailableStaff } from "@/lib/types"
import { getAuthUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Pencil, MapPin, Users, Phone, FileText,
  StickyNote, Building2, Calendar, User,
} from "lucide-react"

export default function LocationDetailPage() {
  return (
    <RoleGuard allowedRoles={["Coordinator", "Admin", "Festmitarbeiter"]}>
      <LocationDetailContent />
    </RoleGuard>
  )
}

function LocationDetailContent() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const user = getAuthUser()
  const role = user?.role
  const canEdit = role === "Coordinator" || role === "Admin"

  const [location, setLocation] = useState<LocationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState("")
  const [staff, setStaff] = useState<AvailableStaff[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    loadLocation()
  }, [id])

  async function loadLocation() {
    setLoadError(null)
    setIsLoading(true)
    try {
      const data = await apiGet<LocationDetail>(`/api/locations/${id}`)
      setLocation(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unterkunft konnte nicht geladen werden.")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadStaff(date: string) {
    if (!date) return
    setStaffError(null)
    setStaffLoading(true)
    try {
      const data = await apiGet<AvailableStaff[]>(`/api/locations/${id}/available-staff?date=${date}`)
      setStaff(data)
    } catch (err) {
      setStaffError(err instanceof Error ? err.message : "Mitarbeiter konnten nicht geladen werden.")
      setStaff([])
    } finally {
      setStaffLoading(false)
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value
    setSelectedDate(date)
    if (date) loadStaff(date)
    else setStaff([])
  }

  const hasPhoto = !!location?.photoUrl

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", backgroundColor: "hsl(var(--background))", overflow: "hidden" }}>

      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0,
          backgroundImage: [
            "linear-gradient(rgba(100,100,100,0.07) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(100,100,100,0.07) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px",
          zIndex: 0, pointerEvents: "none",
        }}
      />

      <DashboardHeader section="Unterkünfte" isLoading={isLoading} />

      <main className="container mx-auto px-6 py-8" style={{ flex: 1, position: "relative", zIndex: 1, maxWidth: "780px" }}>

        {/* Zurück + Aktionen */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/coordinator/locations")}
            style={{ gap: "0.35rem", fontSize: "0.8rem", color: "hsl(var(--muted-foreground))" }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            Zurück zur Übersicht
          </Button>
          {canEdit && location && (
            <Button size="sm" onClick={() => setEditOpen(true)} style={{ gap: "0.35rem", fontSize: "0.8rem" }}>
              <Pencil style={{ width: "13px", height: "13px" }} />
              Bearbeiten
            </Button>
          )}
        </div>

        {loadError && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius)", border: "1px solid hsl(var(--destructive) / 0.3)", backgroundColor: "hsl(var(--destructive) / 0.06)", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.83rem", color: "hsl(var(--destructive))" }}>{loadError}</span>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Skeleton style={{ height: "200px", borderRadius: "var(--radius)" }} />
            <Skeleton style={{ height: "28px", width: "50%" }} />
            <Skeleton style={{ height: "18px", width: "30%" }} />
            <Skeleton style={{ height: "18px", width: "70%" }} />
            <Skeleton style={{ height: "18px", width: "60%" }} />
          </div>
        ) : location ? (
          <>
            {/* Hero */}
            <div
              style={{
                height: "200px",
                borderRadius: "var(--radius)",
                backgroundImage: hasPhoto ? `url(${location.photoUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                background: hasPhoto ? undefined : "linear-gradient(135deg, #38bdf8 0%, #2563eb 60%, #6d28d9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
                position: "relative",
              }}
            >
              {!hasPhoto && <Building2 style={{ width: "52px", height: "52px", color: "rgba(255,255,255,0.7)" }} />}
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                {location.isActive ? (
                  <Badge style={{ backgroundColor: "#166534", color: "#fff", border: "none" }}>Aktiv</Badge>
                ) : (
                  <Badge variant="secondary">Inaktiv</Badge>
                )}
              </div>
            </div>

            {/* Titel */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
                {location.name}
              </h1>
              <Badge variant="outline" style={{ marginTop: "0.4rem" }}>{location.district}</Badge>
            </div>

            {/* Info-Karte */}
            <div
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "1.25rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              {location.address && (
                <InfoRow icon={MapPin} label="Adresse" value={location.address} />
              )}
              {location.capacity != null && (
                <InfoRow icon={Users} label="Kapazität" value={`${location.capacity} Plätze`} />
              )}
              {location.contactPerson && (
                <InfoRow icon={Phone} label="Ansprechperson" value={location.contactPerson} />
              )}
              {location.description && (
                <InfoRow icon={FileText} label="Beschreibung" value={location.description} multiline />
              )}
              {location.notes && (
                <InfoRow icon={StickyNote} label="Notizen" value={location.notes} multiline />
              )}
              <div style={{ paddingTop: "0.5rem", borderTop: "0.5px solid hsl(var(--border))", display: "flex", gap: "1.5rem" }}>
                <span style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))" }}>
                  Erstellt: {new Date(location.createdAt).toLocaleDateString("de-DE")}
                </span>
                {location.updatedAt && (
                  <span style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))" }}>
                    Zuletzt geändert: {new Date(location.updatedAt).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>
            </div>

            {/* Verfügbare Mitarbeiter */}
            <div
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "1.25rem 1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Calendar style={{ width: "16px", height: "16px", color: "hsl(var(--muted-foreground))" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>Verfügbare Mitarbeiter</h2>
              </div>

              <div style={{ marginBottom: "1rem", maxWidth: "220px" }}>
                <Label htmlFor="staff-date" style={{ fontSize: "0.8rem", marginBottom: "0.4rem", display: "block" }}>
                  Datum auswählen
                </Label>
                <Input
                  id="staff-date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              {!selectedDate && (
                <p style={{ fontSize: "0.83rem", color: "hsl(var(--muted-foreground))" }}>
                  Wähle ein Datum, um verfügbare Mitarbeiter zu sehen.
                </p>
              )}

              {staffLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} style={{ height: "40px" }} />
                  ))}
                </div>
              )}

              {staffError && (
                <p style={{ fontSize: "0.83rem", color: "hsl(var(--destructive))" }}>{staffError}</p>
              )}

              {!staffLoading && !staffError && selectedDate && staff.length === 0 && (
                <p style={{ fontSize: "0.83rem", color: "hsl(var(--muted-foreground))" }}>
                  Keine verfügbaren Mitarbeiter für dieses Datum.
                </p>
              )}

              {!staffLoading && staff.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {staff.map((s) => (
                    <div
                      key={s.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "calc(var(--radius) - 2px)",
                        border: "0.5px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--muted) / 0.3)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User style={{ width: "14px", height: "14px", color: "hsl(var(--muted-foreground))" }} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {s.firstname} {s.lastname}
                        </span>
                      </div>
                      <Badge variant="outline" style={{ fontSize: "0.68rem" }}>{s.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>

      <DashboardFooter />

      {location && (
        <LocationFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editLocation={location}
          onSuccess={(saved) => setLocation(saved)}
        />
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  multiline = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: multiline ? "flex-start" : "center" }}>
      <Icon style={{ width: "15px", height: "15px", color: "hsl(var(--muted-foreground))", flexShrink: 0, marginTop: multiline ? "2px" : 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        <span style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.88rem", color: "hsl(var(--foreground))", whiteSpace: multiline ? "pre-wrap" : "normal" }}>
          {value}
        </span>
      </div>
    </div>
  )
}
