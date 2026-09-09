"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { RoleBadge } from "@/components/role-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { ShiftDetails } from "@/lib/types"
import { participantDisplayName } from "@/lib/types"
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

export default function FestmitarbeiterShiftDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <RoleGuard allowedRoles={["Festmitarbeiter"]}>
      <FestmitarbeiterShiftDetailsContent shiftId={id} />
    </RoleGuard>
  )
}

function FestmitarbeiterShiftDetailsContent({ shiftId: shiftId }: { shiftId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [shift, setShift] = useState<ShiftDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const user = getAuthUser()

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
        description: error instanceof Error ? error.message : "Einsatz konnte nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAccept() {
    setIsAccepting(true)
    try {
      await apiPost(`/api/shifts/${shiftId}/accept`)
      toast({
        title: "Einsatz angenommen",
        description: "Du hast diesen Einsatz erfolgreich angenommen.",
      })
      await loadShift()
      router.push("/festmitarbeiter/inbox")
    } catch (error) {
      toast({
        title: "Fehler beim Annehmen",
        description: error instanceof Error ? error.message : "Der Einsatz konnte nicht angenommen werden.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DashboardHeader section="Festmitarbeiter" isLoading />
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
        <DashboardHeader section="Festmitarbeiter" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))" }}>
          Einsatz nicht gefunden
        </div>
        <DashboardFooter />
      </div>
    )
  }

  // Check if current user is the leader
  const isLeader = shift.participants.some((p) => p.userId === user?.userId && p.role === "Leader")
  const canAccept = isLeader && shift.status === "Planned"

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

      <DashboardHeader section="Festmitarbeiter" isLoading={isLoading || isAccepting} />

      <main className="container mx-auto px-6 py-8" style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4" style={{ gap: "0.4rem", fontSize: "0.85rem" }}>
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Inbox
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
                          {participantDisplayName(participant)}
                          {participant.userId === user?.userId && " (Sie)"}
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
                <CardTitle className="text-amber-600">Fehlende Voraussetzungen</CardTitle>
                <CardDescription>Bitte diese Punkte vor der Annahme prüfen</CardDescription>
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

          {canAccept && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isAccepting} className="w-full" size="lg">
                  {isAccepting ? "Wird angenommen..." : "Einsatz annehmen"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Einsatz annehmen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Mit der Annahme bestätigst du:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Du übernimmst die volle Verantwortung als Leader</li>
                      <li>Du bestätigst deine Teilnahme zum geplanten Zeitpunkt</li>
                      <li>Du koordinierst das Team vor Ort</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAccept}>Annehmen & Bestätigen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {shift.status === "Active" && isLeader && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-center text-green-800 font-medium">
                  Du hast diesen Einsatz angenommen und bist der aktive Leader
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}