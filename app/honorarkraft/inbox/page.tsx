"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { ShiftCard } from "@/components/shift-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { apiGet, ApiError } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { ShiftDetails } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HonorarkraftInboxPage() {
  return (
    <RoleGuard allowedRoles={["Honorarkraft"]}>
      <HonorarkraftInboxContent />
    </RoleGuard>
  )
}

function HonorarkraftInboxContent() {
  const router = useRouter()
  const [shifts, setShifts] = useState<ShiftDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [listUnavailable, setListUnavailable] = useState(false)
  const user = getAuthUser()

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    setLoadError(null)
    setListUnavailable(false)
    try {
      const data = await apiGet<ShiftDetails[]>("/api/shifts")
      const myShifts = data.filter((e) =>
        e.participants.some((p) => p.userId === user?.userId && p.role === "Leader")
      )
      setShifts(myShifts)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setListUnavailable(true)
      } else {
        setLoadError(error instanceof Error ? error.message : "Einsätze konnten nicht geladen werden.")
      }
      setShifts([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "hsl(var(--background))",
        overflow: "hidden",
      }}
    >
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

      <DashboardHeader section="Honorarkraft" isLoading={isLoading} />

      <main
        className="container mx-auto px-6 py-8"
        style={{ position: "relative", zIndex: 1, flex: 1 }}
      >
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
            Meine Einsätze
          </h1>
          <p style={{ fontSize: "0.83rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
            Zugewiesene Einsätze einsehen und annehmen
          </p>
        </div>

        <Card style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <CardHeader style={{ paddingBottom: "1rem" }}>
            <CardTitle style={{ fontSize: "1rem", fontWeight: 600 }}>Einsatzübersicht</CardTitle>
            <CardDescription style={{ fontSize: "0.8rem" }}>Alle dir zugewiesenen Einsätze</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "hsl(var(--muted-foreground))",
                  fontSize: "0.85rem",
                }}
              >
                Laden...
              </div>
            ) : listUnavailable ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--muted-foreground))" }}>
                <p style={{ fontSize: "0.9rem" }}>Listenansicht noch nicht verfügbar</p>
                <p style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>
                  <code>GET /api/shifts</code> ist im Backend noch nicht implementiert.
                </p>
              </div>
            ) : loadError ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "0.85rem", color: "hsl(var(--destructive))", marginBottom: "0.75rem" }}>
                  {loadError}
                </p>
                <button
                  onClick={loadShifts}
                  style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                >
                  Erneut versuchen
                </button>
              </div>
            ) : shifts.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--muted-foreground))" }}
              >
                <p style={{ fontSize: "0.9rem" }}>Keine Einsätze vorhanden</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onView={(id) => router.push(`/honorarkraft/shifts/${id}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <DashboardFooter />
    </div>
  )
}
