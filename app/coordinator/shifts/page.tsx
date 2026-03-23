"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { EinsatzCard } from "@/components/einsatz-card"
import { apiGet } from "@/lib/apiClient"
import type { EinsatzDetails } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, FileEdit, CalendarCheck, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { logout } from "@/lib/auth"

export default function CoordinatorEinsaetzePage() {
  return (
    <RoleGuard allowedRoles={["Coordinator"]}>
      <CoordinatorEinsaetzeContent />
    </RoleGuard>
  )
}

function CoordinatorEinsaetzeContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [einsaetze, setEinsaetze] = useState<EinsatzDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadEinsaetze() }, [])

  async function loadEinsaetze() {
    try {
      const data = await apiGet<EinsatzDetails[]>("/api/einsaetze")
      setEinsaetze(data)
    } catch (error) {
      console.warn("API not available:", error)
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
          onClick={() => router.push("/coordinator/einsaetze/new")}
          size="sm"
        >
          Ersten Einsatz erstellen
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>

      {/* Header */}
      <header
        style={{
          borderBottom: "0.5px solid hsl(var(--border))",
          backgroundColor: "hsl(var(--background))",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container mx-auto px-6"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "hsl(var(--foreground))",
              }}
            >
              Einsätze
            </span>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", letterSpacing: "0.05em" }}>
              / Koordinator
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Button
              size="sm"
              onClick={() => router.push("/coordinator/einsaetze/new")}
              style={{ gap: "0.4rem", fontSize: "0.8rem" }}
            >
              <Plus style={{ width: "14px", height: "14px" }} />
              Neuer Einsatz
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              style={{ gap: "0.4rem", fontSize: "0.8rem" }}
            >
              <LogOut style={{ width: "14px", height: "14px" }} />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">

        {/* Seitenüberschrift */}
        <div style={{ marginBottom: "2rem" }}>
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
                      <EinsatzCard key={e.id} einsatz={e} onView={(id) => router.push(`/coordinator/einsaetze/${id}`)} />
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
                      <EinsatzCard key={e.id} einsatz={e} onView={(id) => router.push(`/coordinator/einsaetze/${id}`)} />
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
                      <EinsatzCard key={e.id} einsatz={e} onView={(id) => router.push(`/coordinator/einsaetze/${id}`)} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}