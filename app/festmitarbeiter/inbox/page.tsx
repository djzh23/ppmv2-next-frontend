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
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { logout } from "@/lib/auth"

export default function FestmitarbeiterInboxPage() {
  return (
    <RoleGuard allowedRoles={["Festmitarbeiter"]}>
      <FestmitarbeiterInboxContent />
    </RoleGuard>
  )
}

function FestmitarbeiterInboxContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [shifts, setShifts] = useState<ShiftDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = getAuthUser()

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    try {
      // TODO: Filter by assigned user when API supports it
      const data = await apiGet<ShiftDetails[]>("/api/shifts")
      // Filter client-side for now - only show Shifts where current user is Leader
      const myEinsaetze = data.filter((e) => e.participants.some((p) => p.userId === user?.userId && p.role === 0))
      setShifts(myEinsaetze)
    } catch (error) {
      // For development: silently fail and use empty data
      console.warn("API not available, using empty data:", error)
      setShifts([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Festmitarbeiter Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your assignments</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Einsätze</CardTitle>
            <CardDescription>View your assigned assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No assignments yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shifts.map((einsatz) => (
                  <ShiftCard
                    key={einsatz.id}
                    shift={einsatz}
                    onView={(id) => router.push(`/festmitarbeiter/einsaetze/${id}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}