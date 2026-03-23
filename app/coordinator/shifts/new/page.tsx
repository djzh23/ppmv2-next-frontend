"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { LocationSelect } from "@/components/location-select"
import { LeaderPicker } from "@/components/leader-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiPost } from "@/lib/apiClient"
import type { CreateShiftRequest } from "@/lib/types"
import { ParticipantRole } from "@/lib/types"
import { ArrowLeft } from "lucide-react"

export default function NewShiftPage() {
  return (
    <RoleGuard allowedRoles={["Coordinator"]}>
      <NewShiftContent />
    </RoleGuard>
  )
}

function NewShiftContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [locationId, setLocationId] = useState("")
  const [leaderId, setLeaderId] = useState("")

  async function handleSubmit(e: React.FormEvent, shouldPublish: boolean) {
    e.preventDefault()

    if (!leaderId) {
      toast({
        title: "Leader required",
        description: "You must assign exactly one leader to the Einsatz",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const startAtUtc = new Date(`${startDate}T${startTime}`).toISOString()
      const endAtUtc = new Date(`${endDate}T${endTime}`).toISOString()

      const payload: CreateShiftRequest = {
        title,
        description,
        startAtUtc,
        endAtUtc,
        locationId,
        participants: [
          {
            userId: leaderId,
            role: ParticipantRole.Leader,
          },
        ],
      }

      const createdEinsatz = await apiPost<{ id: string }>("/api/einsaetze", payload)

      if (shouldPublish && createdEinsatz.id) {
        await apiPost(`/api/einsaetze/${createdEinsatz.id}/publish`)
        toast({
          title: "Einsatz published",
          description: "The Einsatz has been created and published successfully",
        })
      } else {
        toast({
          title: "Draft saved",
          description: "The Einsatz has been saved as a draft",
        })
      }

      router.push("/coordinator/shifts")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Einsatz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = title && description && startDate && startTime && endDate && endTime && locationId && leaderId

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Einsatz</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to create a new assignment</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Einsatz Details</CardTitle>
            <CardDescription>Enter the information for the new assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <LocationSelect value={locationId} onChange={setLocationId} required />

              <LeaderPicker value={leaderId} onChange={setLeaderId} required />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={!isFormValid || isLoading}
                  className="flex-1"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={!isFormValid || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Save & Publish"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
