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

export default function HonorarkraftShiftDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <RoleGuard allowedRoles={["Honorarkraft"]}>
      <HonorarkraftShiftDetailsContent shiftId={id} />
    </RoleGuard>
  )
}

function HonorarkraftShiftDetailsContent({ shiftId: shiftId }: { shiftId: string }) {
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
      // For development: silently fail
      console.warn("API not available:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAccept() {
    setIsAccepting(true)
    try {
      await apiPost(`/api/shifts/${shiftId}/accept`)
      toast({
        title: "Shift accepted",
        description: "You have successfully accepted this Shift and taken responsibility",
      })
      await loadShift()
      router.push("/honorarkraft/inbox")
    } catch (error) {
      // For development: silently fail
      console.warn("API not available:", error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Einsatz not found</p>
      </div>
    )
  }

  // Check if current user is the leader
  const isLeader = shift.participants.some((p) => p.userId === user?.userId && p.role === 0)
  const canAccept = isLeader && shift.status === "Planned"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{shift.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{shift.description}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={shift.status} />
              <ReadinessBadge readiness={shift.readiness} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                  {shift.location?.address && (
                    <p className="text-sm text-muted-foreground">{shift.location.address}</p>
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
                          {participant.userId === user?.userId && " (You)"}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <RoleBadge role={participant.role as 0 | 1 | 2} />
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
                <CardDescription>Please review these items before accepting</CardDescription>
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
                  {isAccepting ? "Accepting..." : "Accept Einsatz"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accept this Shift?</AlertDialogTitle>
                  <AlertDialogDescription>
                    By accepting, you confirm that you:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Take full responsibility as the leader</li>
                      <li>Confirm your attendance at the scheduled time</li>
                      <li>Commit to coordinating the team</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAccept}>Accept & Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {shift.status === "Active" && isLeader && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-center text-green-800 font-medium">
                  You have accepted this Einsatz and are the active leader
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}