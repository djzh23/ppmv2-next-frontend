"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { ShiftCard } from "@/components/shift-card"
import { apiGet, ApiError } from "@/lib/apiClient"
import type { ShiftDetails } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Plus, FileEdit, CalendarCheck, Zap } from "lucide-react"

export default function CoordinatorShiftsPage() {
  return (
    <RoleGuard allowedRoles={["Coordinator"]}>
      <CoordinatorShiftsContent />
    </RoleGuard>
  )
}

function CoordinatorShiftsContent() {
  const router = useRouter()
  const [einsaetze, setEinsaetze] = useState<ShiftDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [listUnavailable, setListUnavailable] = useState(false)

  useEffect(() => { loadEinsaetze() }, [])

  async function loadEinsaetze() {
    setLoadError(null)
    setListUnavailable(false)
    try {
      const data = await apiGet<ShiftDetails[]>("/api/shifts")
      setEinsaetze(data)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setListUnavailable(true)
      } else {
        setLoadError(error instanceof Error ? error.message : "Einsätze konnten nicht geladen werden.")
      }
      setEinsaetze([])
    } finally {
      setIsLoading(false)
    }
  }

  const draftEinsaetze = einsaetze.filter((e) => e.status === "Draft")
  const plannedEinsaetze = einsaetze.filter((e) => e.status === "Planned")
  const activeEinsaetze = einsaetze.filter((e) => e.status === "Active")

  const statCards = [
    { label: "Entwürfe", value: draftEinsaetze.length, icon: FileEdit, color: "#1e40af", bg: "#dbeafe" },
    { label: "Geplant",  value: plannedEinsaetze.length, icon: CalendarCheck, color: "#b45309", bg: "#fef9c3" },
    { label: "Aktiv",    value: activeEinsaetze.length, icon: Zap, color: "#166534", bg: "#dcfce7" },
  ]

  const EmptyState = ({ label, showCreate = false }: { label: string; showCreate?: boolean }) => (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 1rem",
        color: "hsl(var(--muted-foreground))",
      }}
    >
      <p style={{ fontSize: "0.9rem", marginBottom: showCreate ? "1rem" : 0 }}>
        Keine {label} vorhanden
      </p>
      {showCreate && (
        <Button
          onClick={() => router.push("/coordinator/shifts/new")}
          size="sm"
        >
          Ersten Einsatz erstellen
        </Button>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", backgroundColor: "hsl(var(--background))", overflow: "hidden" }}>

      {/* Grid-Hintergrund */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: [
            "linear-gradient(rgba(100,100,100,0.07) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(100,100,100,0.07) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <DashboardHeader section="Koordinator" isLoading={isLoading} />

      <main className="container mx-auto px-6 py-8" style={{ flex: 1, position: "relative", zIndex: 1 }}>

        {listUnavailable && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--muted))",
              fontSize: "0.83rem",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Die Listenansicht ist noch nicht verfügbar — <code style={{ fontSize: "0.78rem" }}>GET /api/shifts</code> ist im Backend noch nicht implementiert.
          </div>
        )}

        {loadError && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--destructive) / 0.3)",
              backgroundColor: "hsl(var(--destructive) / 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "0.83rem", color: "hsl(var(--destructive))" }}>
              Einsätze konnten nicht geladen werden — {loadError}
            </span>
            <button
              onClick={loadEinsaetze}
              style={{
                fontSize: "0.78rem",
                color: "hsl(var(--destructive))",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Seitenüberschrift */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "hsl(var(--foreground))",
                margin: 0,
              }}
            >
              Einsätze
            </h1>
            <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
              Einsätze erstellen, verwalten und veröffentlichen
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/coordinator/shifts/new")}
            style={{ gap: "0.4rem", fontSize: "0.8rem" }}
          >
            <Plus style={{ width: "14px", height: "14px" }} />
            Neuer Einsatz
          </Button>
        </div>

        {/* Stat-Karten */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "2rem",
          }}
        >
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "36px", height: "36px",
                  borderRadius: "8px",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: "16px", height: "16px", color }} />
              </div>
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1, color: "hsl(var(--foreground))" }}>
                  {value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs-Card */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Einsätze</CardTitle>
            <CardDescription>Einsätze nach Status anzeigen und verwalten</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="draft" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="draft">
                  Entwurf{draftEinsaetze.length > 0 && ` (${draftEinsaetze.length})`}
                </TabsTrigger>
                <TabsTrigger value="planned">
                  Geplant{plannedEinsaetze.length > 0 && ` (${plannedEinsaetze.length})`}
                </TabsTrigger>
                <TabsTrigger value="active">
                  Aktiv{activeEinsaetze.length > 0 && ` (${activeEinsaetze.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draft" className="mt-6">
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>
                    Laden...
                  </div>
                ) : draftEinsaetze.length === 0 ? (
                  <EmptyState label="Entwürfe" showCreate />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {draftEinsaetze.map((e) => (
                      <ShiftCard key={e.id} shift={e} onView={(id) => router.push(`/coordinator/shifts/${id}`)} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="planned" className="mt-6">
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>Laden...</div>
                ) : plannedEinsaetze.length === 0 ? (
                  <EmptyState label="geplante Einsätze" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plannedEinsaetze.map((e) => (
                      <ShiftCard key={e.id} shift={e} onView={(id) => router.push(`/coordinator/shifts/${id}`)} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>Laden...</div>
                ) : activeEinsaetze.length === 0 ? (
                  <EmptyState label="aktive Einsätze" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeEinsaetze.map((e) => (
                      <ShiftCard key={e.id} shift={e} onView={(id) => router.push(`/coordinator/shifts/${id}`)} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <DashboardFooter />
    </div>
  )
}