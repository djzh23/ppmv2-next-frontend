"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { EinsatzCard } from "@/components/einsatz-card"
import { apiGet } from "@/lib/apiClient"
import type { EinsatzDetails } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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

  useEffect(() => {
    loadEinsaetze()
  }, [])

  async function loadEinsaetze() {
    try {
      // TODO: Use query params when available: /api/einsaetze?status=Draft
      const data = await apiGet<EinsatzDetails[]>("/api/einsaetze")
      setEinsaetze(data)
    } catch (error) {
      // For development: silently fail and use empty data
      console.warn("API not available, using empty data:", error)
      setEinsaetze([])
    } finally {
      setIsLoading(false)
    }
  }

  const draftEinsaetze = einsaetze.filter((e) => e.status === "Draft")
  const plannedEinsaetze = einsaetze.filter((e) => e.status === "Planned")
  const activeEinsaetze = einsaetze.filter((e) => e.status === "Active")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Einsätze Management</h1>
            <p className="text-sm text-muted-foreground">Create and manage assignments</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/coordinator/einsaetze/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Einsatz
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Einsätze</CardTitle>
            <CardDescription>View and manage your assignments by status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="draft" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="draft">
                  Draft {draftEinsaetze.length > 0 && `(${draftEinsaetze.length})`}
                </TabsTrigger>
                <TabsTrigger value="planned">
                  Planned {plannedEinsaetze.length > 0 && `(${plannedEinsaetze.length})`}
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active {activeEinsaetze.length > 0 && `(${activeEinsaetze.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draft" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : draftEinsaetze.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No draft Einsätze</p>
                    <Button onClick={() => router.push("/coordinator/einsaetze/new")} className="mt-4">
                      Create your first Einsatz
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {draftEinsaetze.map((einsatz) => (
                      <EinsatzCard
                        key={einsatz.id}
                        einsatz={einsatz}
                        onView={(id) => router.push(`/coordinator/einsaetze/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="planned" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : plannedEinsaetze.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No planned Einsätze</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plannedEinsaetze.map((einsatz) => (
                      <EinsatzCard
                        key={einsatz.id}
                        einsatz={einsatz}
                        onView={(id) => router.push(`/coordinator/einsaetze/${id}`)}
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
                        onView={(id) => router.push(`/coordinator/einsaetze/${id}`)}
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
