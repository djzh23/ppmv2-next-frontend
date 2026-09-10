"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { LocationCard } from "@/components/location-card"
import { LocationFormDialog } from "@/components/location-form-dialog"
import { apiGet, apiDelete } from "@/lib/apiClient"
import type { LocationDetail } from "@/lib/types"
import { getAuthUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Building2, CheckCircle, XCircle, Search } from "lucide-react"

type FilterValue = "all" | "active" | "inactive"

export default function CoordinatorLocationsPage() {
  return (
    <RoleGuard allowedRoles={["Coordinator", "Admin"]}>
      <CoordinatorLocationsContent />
    </RoleGuard>
  )
}

function CoordinatorLocationsContent() {
  const user = getAuthUser()
  const role = user?.role
  const canEdit = role === "Coordinator" || role === "Admin"

  const [locations, setLocations] = useState<LocationDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterValue>("all")
  const [search, setSearch] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editLocation, setEditLocation] = useState<LocationDetail | null>(null)

  useEffect(() => { loadLocations() }, [])

  async function loadLocations() {
    setLoadError(null)
    try {
      const data = await apiGet<LocationDetail[]>("/api/locations")
      setLocations(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unterkünfte konnten nicht geladen werden.")
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await apiDelete(`/api/locations/${id}`)
      await loadLocations()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Deaktivierung fehlgeschlagen.")
    }
  }

  function openCreate() {
    setEditLocation(null)
    setDialogOpen(true)
  }

  function openEdit(location: LocationDetail) {
    setEditLocation(location)
    setDialogOpen(true)
  }

  const total = locations.length
  const active = locations.filter((l) => l.isActive).length
  const inactive = total - active

  const filtered = locations.filter((l) => {
    if (filter === "active" && !l.isActive) return false
    if (filter === "inactive" && l.isActive) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return l.name.toLowerCase().includes(q) || l.district.toLowerCase().includes(q)
    }
    return true
  })

  const statCards = [
    { label: "Gesamt",  value: total,    id: "all"      as FilterValue, color: "#2563eb", bg: "#dbeafe", icon: Building2   },
    { label: "Aktiv",   value: active,   id: "active"   as FilterValue, color: "#166534", bg: "#dcfce7", icon: CheckCircle },
    { label: "Inaktiv", value: inactive, id: "inactive" as FilterValue, color: "#9a3412", bg: "#fee2e2", icon: XCircle     },
  ]

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

      <main className="container mx-auto px-6 py-8" style={{ flex: 1, position: "relative", zIndex: 1 }}>

        {loadError && (
          <div
            style={{
              marginBottom: "1.25rem", padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--destructive) / 0.3)",
              backgroundColor: "hsl(var(--destructive) / 0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
            }}
          >
            <span style={{ fontSize: "0.83rem", color: "hsl(var(--destructive))" }}>{loadError}</span>
            <button
              onClick={loadLocations}
              style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Seitenüberschrift */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", margin: 0 }}>
              Unterkünfte
            </h1>
            <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
              Unterkünfte erstellen, bearbeiten und verwalten
            </p>
          </div>
          {canEdit && (
            <Button size="sm" onClick={openCreate} style={{ gap: "0.4rem", fontSize: "0.8rem" }}>
              <Plus style={{ width: "14px", height: "14px" }} />
              Neue Unterkunft
            </Button>
          )}
        </div>

        {/* Stat-Karten (klickbar als Filter) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "1.5rem" }}>
          {statCards.map(({ label, value, id, color, bg, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id === filter ? "all" : id)}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: filter === id ? `1.5px solid ${color}` : "0.5px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "1rem 1.25rem",
                display: "flex", alignItems: "center", gap: "0.85rem",
                cursor: "pointer", textAlign: "left",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: "16px", height: "16px", color }} />
              </div>
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1, color: "hsl(var(--foreground))" }}>{value}</div>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>{label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Suche */}
        <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: "360px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name oder Bezirk suchen…"
            style={{ paddingLeft: "2rem", fontSize: "0.85rem" }}
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Skeleton style={{ height: "110px", borderRadius: "var(--radius)" }} />
                <Skeleton style={{ height: "20px", width: "60%" }} />
                <Skeleton style={{ height: "16px", width: "80%" }} />
                <Skeleton style={{ height: "16px", width: "50%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "hsl(var(--muted-foreground))" }}>
            <Building2 style={{ width: "40px", height: "40px", margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              {locations.length === 0 ? "Noch keine Unterkünfte vorhanden" : "Keine Unterkünfte gefunden"}
            </p>
            {canEdit && locations.length === 0 && (
              <Button size="sm" onClick={openCreate} style={{ gap: "0.4rem" }}>
                <Plus style={{ width: "14px", height: "14px" }} />
                Erste Unterkunft erstellen
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                canEdit={canEdit}
                onEdit={openEdit}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        )}
      </main>

      <DashboardFooter />

      <LocationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editLocation={editLocation}
        onSuccess={loadLocations}
      />
    </div>
  )
}
