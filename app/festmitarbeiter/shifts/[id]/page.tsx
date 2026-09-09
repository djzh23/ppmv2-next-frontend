"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { RoleBadge } from "@/components/role-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPut } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { ShiftDetails, ConfirmationStatus } from "@/lib/types"
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

function confirmationBadge(status: ConfirmationStatus | undefined) {
  if (!status) return null
  const styles: Record<ConfirmationStatus, { bg: string; color: string; label: string }> = {
    Invited: { bg: "#f59e0b", color: "#fff", label: "Eingeladen" },
    Accepted: { bg: "#16a34a", color: "#fff", label: "Angenommen" },
    Declined: { bg: "#dc2626", color: "#fff", label: "Abgelehnt" },
  }
  const s = styles[status]
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.7rem",
        fontWeight: 500,
        padding: "0.1rem 0.45rem",
        borderRadius: "9999px",
        backgroundColor: s.bg,
        color: s.color,
        marginLeft: "0.4rem",
      }}
    >
      {s.label}
    </span>
  )
}

function FestmitarbeiterShiftDetailsContent({ shiftId }: { shiftId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [shift, setShift] = useState<ShiftDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProposing, setIsProposing] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
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

  async function handlePropose() {
    setIsProposing(true)
    try {
      await apiPut(`/api/shifts/${shiftId}/propose`)
      toast({
        title: "Einsatz vorgeschlagen",
        description: "Der Einsatz wurde zur Genehmigung eingereicht.",
      })
      await loadShift()
    } catch (error) {
      toast({
        title: "Fehler beim Vorschlagen",
        description: error instanceof Error ? error.message : "Der Einsatz konnte nicht vorgeschlagen werden.",
        variant: "destructive",
      })
    } finally {
      setIsProposing(false)
    }
  }

  async function handleRespond(response: "Accepted" | "Declined") {
    setIsResponding(true)
    try {
      await apiPut(`/api/shifts/${shiftId}/participants/${user?.userId}/respond`, { response })
      toast({
        title: response === "Accepted" ? "Einsatz angenommen" : "Einsatz abgelehnt",
        description: response === "Accepted"
          ? "Du hast diesen Einsatz erfolgreich angenommen."
          : "Du hast diesen Einsatz abgelehnt.",
      })
      await loadShift()
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Die Antwort konnte nicht übermittelt werden.",
        variant: "destructive",
      })
    } finally {
      setIsResponding(false)
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

  const myParticipant = shift.participants.find((p) => p.userId === user?.userId)
  const isBusy = isProposing || isResponding

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

      <DashboardHeader section="Festmitarbeiter" isLoading={isLoading || isBusy} />

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
              <CardTitle>Zeitplan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Beginn</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(shift.startAtUtc), "PPpp")}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Ende</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(shift.endAtUtc), "PPpp")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Standort</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{shift.location?.name || "Kein Standort gesetzt"}</p>
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
              <CardDescription>{shift.participants.length} Teilnehmer</CardDescription>
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
                          {confirmationBadge(participant.confirmationStatus)}
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

          {shift.status === "Draft" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isBusy} className="w-full" size="lg">
                  {isProposing ? "Wird eingereicht..." : "Vorschlagen"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Einsatz vorschlagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Der Einsatz wird zur Genehmigung eingereicht und erhält den Status „Zur Genehmigung".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePropose}>Vorschlagen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {myParticipant?.confirmationStatus === "Invited" && shift.status === "PendingApproval" && (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isBusy} className="flex-1" size="lg">
                    {isResponding ? "Wird verarbeitet..." : "Annehmen"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Einsatz annehmen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Du bestätigst deine Teilnahme an diesem Einsatz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRespond("Accepted")}>Annehmen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isBusy} className="flex-1" size="lg">
                    {isResponding ? "Wird verarbeitet..." : "Ablehnen"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Einsatz ablehnen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Du lehnst die Einladung zu diesem Einsatz ab.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRespond("Declined")}>Ablehnen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {shift.status === "Active" && myParticipant && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-center text-green-800 font-medium">
                  Du nimmst an diesem aktiven Einsatz teil
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
