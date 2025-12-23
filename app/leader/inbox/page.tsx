"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { EinsatzCard } from "@/components/einsatz-card"
import { apiGet } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { EinsatzDetails } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { logout } from "@/lib/auth"

export default function LeaderInboxPage() {
  return (
    <RoleGuard allowedRoles={["Festmitarbeiter", "Honorarkraft"]}>
      <LeaderInboxContent />
    </RoleGuard>
  )
}

function LeaderInboxContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [einsaetze, setEinsaetze] = useState<EinsatzDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = getAuthUser()

  useEffect(() => {
    loadEinsaetze()
  }, [])

  async function loadEinsaetze() {
    try {
      // TODO: Filter by assigned user when API supports it
      const data = await apiGet<EinsatzDetails[]>("/api/einsaetze")
      // Filter client-side for now - only show Einsätze where current user is Leader
      const myEinsaetze = data.filter((e) => e.participants.some((p) => p.userId === user?.userId && p.role === 0))
      setEinsaetze(myEinsaetze)
    } catch (error) {
      // For development: silently fail and use empty data
      console.warn("API not available, using empty data:", error)
      setEinsaetze([])
    } finally {
      setIsLoading(false)
    }
  }

  const toAcceptEinsaetze = einsaetze.filter((e) => e.status === "Planned")
  const activeEinsaetze = einsaetze.filter((e) => e.status === "Active")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Inbox</h1>
            <p className="text-sm text-muted-foreground">Review and accept your assigned Einsätze</p>
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
            <CardDescription>Assignments where you are the designated leader</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="to-accept" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="to-accept">
                  To Accept {toAcceptEinsaetze.length > 0 && `(${toAcceptEinsaetze.length})`}
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active {activeEinsaetze.length > 0 && `(${activeEinsaetze.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="to-accept" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : toAcceptEinsaetze.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No Einsätze to accept</p>
                    <p className="text-sm mt-2">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {toAcceptEinsaetze.map((einsatz) => (
                      <EinsatzCard
                        key={einsatz.id}
                        einsatz={einsatz}
                        onView={(id) => router.push(`/leader/einsaetze/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : activeEinsaetze.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No active Einsätze</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeEinsaetze.map((einsatz) => (
                      <EinsatzCard
                        key={einsatz.id}
                        einsatz={einsatz}
                        onView={(id) => router.push(`/leader/einsaetze/${id}`)}
                      />
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
