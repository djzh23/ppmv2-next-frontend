"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { RoleBadge } from "@/components/role-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost, apiPut } from "@/lib/apiClient"
import { getAuthUser, getUserRole } from "@/lib/auth"
import type { ShiftDetails, ConfirmationStatus, AvailableStaff } from "@/lib/types"
import { participantDisplayName, ParticipantRole } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { ReadinessBadge } from "@/components/readiness-badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ArrowLeft, Calendar, MapPin, Users, UserPlus } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function FestmitarbeiterShiftDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <RoleGuard allowedRoles={["Festmitarbeiter", "Honorarkraft"]}>
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

const PARTICIPANT_ROLES = [
  { value: ParticipantRole.Member, label: "Mitglied" },
  { value: ParticipantRole.Support, label: "Unterstützung" },
] as const

function FestmitarbeiterShiftDetailsContent({ shiftId }: { shiftId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [shift, setShift] = useState<ShiftDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProposing, setIsProposing] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const user = getAuthUser()
  const userRole = getUserRole()
  const section = userRole === "Honorarkraft" ? "Honorarkraft" : "Festmitarbeiter"

  // Add participant dialog state
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [availableStaff, setAvailableStaff] = useState<AvailableStaff[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<typeof ParticipantRole.Member | typeof ParticipantRole.Support>(ParticipantRole.Member)
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)

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
      await apiPut(`/api/shifts/${shiftId}/respond`, { accept: response === "Accepted" })
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

  async function handleCancel() {
    setIsCancelling(true)
    try {
      await apiPut(`/api/shifts/${shiftId}/cancel`)
      toast({
        title: "Einsatz abgesagt",
        description: "Der Einsatz wurde erfolgreich abgesagt.",
      })
      router.push("/festmitarbeiter/inbox")
    } catch (error) {
      toast({
        title: "Fehler beim Absagen",
        description: error instanceof Error ? error.message : "Der Einsatz konnte nicht abgesagt werden.",
        variant: "destructive",
      })
      setIsCancelling(false)
    }
  }

  async function openAddParticipantDialog() {
    if (!shift) return
    setShowAddParticipant(true)
    setSelectedUserId("")
    setSelectedRole(ParticipantRole.Member)
    setLoadingStaff(true)
    try {
      const startAt = encodeURIComponent(new Date(shift.startAtUtc).toISOString())
      const endAt = encodeURIComponent(shift.endAtUtc ? new Date(shift.endAtUtc).toISOString() : new Date(shift.startAtUtc).toISOString())
      const staff = await apiGet<AvailableStaff[]>(
        `/api/users/staff?startAt=${startAt}&endAt=${endAt}`
      )
      // Filter out existing participants
      const existingIds = new Set(shift.participants.map((p) => p.userId.toLowerCase()))
      setAvailableStaff(staff.filter((s) => !existingIds.has(s.userId.toLowerCase())))
    } catch {
      toast({ title: "Mitarbeiter konnten nicht geladen werden.", variant: "destructive" })
      setShowAddParticipant(false)
    } finally {
      setLoadingStaff(false)
    }
  }

  async function handleAddParticipant() {
    if (!selectedUserId) return
    setIsAddingParticipant(true)
    try {
      await apiPost(`/api/shifts/${shiftId}/participants`, {
        userId: selectedUserId,
        role: selectedRole,
      })
      toast({ title: "Mitglied hinzugefügt." })
      setShowAddParticipant(false)
      await loadShift()
    } catch (error) {
      toast({
        title: "Fehler beim Hinzufügen",
        description: error instanceof Error ? error.message : "Mitglied konnte nicht hinzugefügt werden.",
        variant: "destructive",
      })
    } finally {
      setIsAddingParticipant(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DashboardHeader section={section} isLoading />
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
        <DashboardHeader section={section} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))" }}>
          Einsatz nicht gefunden
        </div>
        <DashboardFooter />
      </div>
    )
  }

  const myParticipant = shift.participants.find(
    (p) => p.userId.toLowerCase() === user?.userId?.toLowerCase()
  )
  const isLeader = myParticipant?.role === "Leader"
  const canModify = shift.status === "Draft" || shift.status === "PendingApproval"
  const isBusy = isProposing || isResponding || isCancelling
  const hasAnyAction =
    (isLeader && canModify) ||
    (myParticipant?.confirmationStatus === "Invited" && shift.status === "PendingApproval") ||
    shift.status === "Draft"

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

      <DashboardHeader section={section} isLoading={isLoading || isBusy} />

      <main className="container mx-auto px-3 sm:px-6 py-8" style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4" style={{ gap: "0.4rem", fontSize: "0.85rem" }}>
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Inbox
        </Button>
        <div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
          style={{ marginBottom: "1.5rem" }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", margin: 0 }}>
              {shift.title}
            </h1>
            {shift.description && (
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>{shift.description}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle>Team</CardTitle>
                <CardDescription>{shift.participants.length} Teilnehmer</CardDescription>
              </div>
              {isLeader && canModify && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openAddParticipantDialog}
                  disabled={isBusy}
                  style={{ gap: "0.35rem", fontSize: "0.78rem" }}
                >
                  <UserPlus className="h-4 w-4" />
                  Mitglied hinzufügen
                </Button>
              )}
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
            <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Leader-only: Cancel shift */}
          {isLeader && canModify && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isBusy} className="w-full">
                  {isCancelling ? "Wird abgesagt..." : "Einsatz absagen"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Einsatz absagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Der Einsatz wird unwiderruflich abgesagt. Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Absagen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {shift.status === "Active" && myParticipant && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-center text-green-800 font-medium">
                  {isLeader ? "Du leitest diesen aktiven Einsatz als Leader" : "Du nimmst an diesem aktiven Einsatz teil"}
                </p>
              </CardContent>
            </Card>
          )}

          {isLeader && shift.status === "Planned" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-center text-blue-800 font-medium">
                  Du bist der Leader dieses geplanten Einsatzes
                </p>
              </CardContent>
            </Card>
          )}

          {myParticipant && !hasAnyAction && shift.status !== "Active" && shift.status !== "Planned" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                  Keine Aktionen verfügbar für Status: {shift.status}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <DashboardFooter />

      {/* Add participant dialog */}
      <Dialog open={showAddParticipant} onOpenChange={(open) => { if (!open) setShowAddParticipant(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mitglied hinzufügen</DialogTitle>
            <DialogDescription>
              Verfügbare Mitarbeiter für diesen Standort und Termin
            </DialogDescription>
          </DialogHeader>

          {loadingStaff ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>
              Laden...
            </div>
          ) : availableStaff.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "1rem 0" }}>
              Keine verfügbaren Mitarbeiter gefunden.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "hsl(var(--foreground))", display: "block", marginBottom: "0.4rem" }}>
                  Mitarbeiter
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.75rem",
                    fontSize: "0.85rem",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    backgroundColor: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  <option value="">Bitte auswählen...</option>
                  {availableStaff.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.lastname}, {s.firstname}{s.hasConflict ? " ⚠ Bereits eingeteilt" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "hsl(var(--foreground))", display: "block", marginBottom: "0.4rem" }}>
                  Rolle
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as typeof ParticipantRole.Member | typeof ParticipantRole.Support)}
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.75rem",
                    fontSize: "0.85rem",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    backgroundColor: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  {PARTICIPANT_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddParticipant(false)} disabled={isAddingParticipant} className="w-full sm:w-auto">
              Abbrechen
            </Button>
            <Button
              onClick={handleAddParticipant}
              disabled={!selectedUserId || isAddingParticipant || loadingStaff}
              className="w-full sm:w-auto"
            >
              {isAddingParticipant ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
