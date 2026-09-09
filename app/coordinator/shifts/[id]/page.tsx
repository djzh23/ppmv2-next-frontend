"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { RoleBadge } from "@/components/role-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost } from "@/lib/apiClient"
import type { ShiftDetails } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { ReadinessBadge } from "@/components/readiness-badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ShiftDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <RoleGuard allowedRoles={["Coordinator"]}>
      <ShiftDetailsContent shiftId={id} />
    </RoleGuard>
  )
}

function ShiftDetailsContent({ shiftId }: { shiftId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [shift, setShift] = useState<ShiftDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    loadShift()
  }, [shiftId])

  async function loadShift() {
    try {
      const data = await apiGet<ShiftDetails>(`/api/shifts/${shiftId}`)
      setShift(data)
    } catch (error) {
      toast({
        title: "Fehler beim Laden",
        description: error instanceof Error ? error.message : "Der Einsatz konnte nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePublish() {
    setIsPublishing(true)
    try {
      await apiPost(`/api/shifts/${shiftId}/publish`)
      toast({
        title: "Einsatz veröffentlicht",
        description: "Der Einsatz ist jetzt für den zugewiesenen Leader sichtbar.",
      })
      await loadShift()
    } catch (error) {
      toast({
        title: "Fehler beim Veröffentlichen",
        description: error instanceof Error ? error.message : "Der Einsatz konnte nicht veröffentlicht werden.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DashboardHeader section="Koordinator" isLoading />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
        <DashboardFooter />
      </div>
    )
  }

  if (!shift) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DashboardHeader section="Koordinator" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))" }}>
          Einsatz nicht gefunden
        </div>
        <DashboardFooter />
      </div>
    )
  }

  const leader = shift.participants.find((p) => p.role === "Leader")

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

      <DashboardHeader section="Koordinator" isLoading={isLoading || isPublishing} />

      <main className="container mx-auto px-6 py-8" style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4" style={{ gap: "0.4rem", fontSize: "0.85rem" }}>
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", margin: 0 }}>
              {shift.title}
            </h1>
            {shift.description && (
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>{shift.description}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <StatusBadge status={shift.status} />
            <ReadinessBadge readiness={shift.readiness} />
          </div>
        </div>
        <div className="grid gap-6 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Start</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(shift.startAtUtc), "PPpp")}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">End</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(shift.endAtUtc), "PPpp")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{shift.location?.name || "Location not set"}</p>
                  {shift.location?.district && (
                    <p className="text-sm text-muted-foreground">{shift.location.district}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>{shift.participants.length} participant(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shift.participants.map((participant, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {participant.user?.firstname} {participant.user?.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <RoleBadge role={participant.role} />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {shift.missingRequirements && shift.missingRequirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">Missing Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {shift.missingRequirements.map((req, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {shift.status === "Draft" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isPublishing} className="w-full">
                  {isPublishing ? "Publishing..." : "Publish Einsatz"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Einsatz veröffentlichen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Der Status wird auf „Geplant" gesetzt und der Einsatz wird für{" "}
                    <strong>
                      {leader?.user?.firstname} {leader?.user?.lastname}
                    </strong>{" "}
                    sichtbar, der ihn annehmen kann.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePublish}>Veröffentlichen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
