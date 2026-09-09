"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { ShiftCard } from "@/components/shift-card"
import { apiGet } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { ShiftDetails } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function LeaderInboxPage() {
  return (
    <RoleGuard allowedRoles={["Festmitarbeiter", "Honorarkraft"]}>
      <LeaderInboxContent />
    </RoleGuard>
  )
}

function LeaderInboxContent() {
  const router = useRouter()
  const [shifts, setShifts] = useState<ShiftDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const user = getAuthUser()

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    setLoadError(null)
    try {
      // TODO: Filter by assigned user when API supports it
      const data = await apiGet<ShiftDetails[]>("/api/shifts")
      // Filter client-side for now - only show Shifts where current user is Leader
      const myShifts = data.filter((e) => e.participants.some((p) => p.userId === user?.userId && p.role === "Leader"))
      setShifts(myShifts)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Einsätze konnten nicht geladen werden.")
      setShifts([])
    } finally {
      setIsLoading(false)
    }
  }

  const toAcceptShifts = shifts.filter((e) => e.status === "Planned")
  const activeShifts = shifts.filter((e) => e.status === "Active")

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "hsl(var(--background))" }}>
      <DashboardHeader section="Leader" isLoading={isLoading} />

      <main className="container mx-auto px-6 py-8" style={{ flex: 1 }}>
        <Card>
          <CardHeader>
            <CardTitle>My Einsätze</CardTitle>
            <CardDescription>Assignments where you are the designated leader</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="to-accept" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="to-accept">
                  To Accept {toAcceptShifts.length > 0 && `(${toAcceptShifts.length})`}
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active {activeShifts.length > 0 && `(${activeShifts.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="to-accept" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Laden...</div>
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
                ) : toAcceptShifts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No Einsätze to accept</p>
                    <p className="text-sm mt-2">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {toAcceptShifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        onView={(id) => router.push(`/leader/shifts/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Laden...</div>
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
                ) : activeShifts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No active Einsätze</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeShifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        onView={(id) => router.push(`/leader/shifts/${id}`)}
                      />
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
