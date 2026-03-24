"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { ShiftCard } from "@/components/shift-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { apiGet } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { ShiftDetails } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FestmitarbeiterInboxPage() {
  return (
    <RoleGuard allowedRoles={["Festmitarbeiter"]}>
      <FestmitarbeiterInboxContent />
    </RoleGuard>
  )
}

function FestmitarbeiterInboxContent() {
  const router = useRouter()
  const [shifts, setShifts] = useState<ShiftDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = getAuthUser()

  useEffect(() => { loadShifts() }, [])

  async function loadShifts() {
    try {
      const data = await apiGet<ShiftDetails[]>("/api/einsaetze")
      const myEinsaetze = data.filter((e) => e.participants.some((p) => p.userId === user?.userId && p.role === "Leader"))
      setShifts(myEinsaetze)
    } catch (error) {
      console.warn("API not available:", error)
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

      <DashboardHeader section="Festmitarbeiter" isLoading={isLoading} />

      <main
        className="container mx-auto px-6 py-8"
        style={{ position: "relative", zIndex: 1, flex: 1 }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", margin: 0 }}>
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
              <div style={{ textAlign: "center", padding: "2rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>
                Laden...
              </div>
            ) : shifts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--muted-foreground))" }}>
                <p style={{ fontSize: "0.9rem" }}>Keine Einsätze vorhanden</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shifts.map((einsatz) => (
                  <ShiftCard
                    key={einsatz.id}
                    shift={einsatz}
                    onView={(id) => router.push(`/festmitarbeiter/shifts/${id}`)}
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
