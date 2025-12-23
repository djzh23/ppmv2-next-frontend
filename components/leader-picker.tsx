"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { apiGet } from "@/lib/apiClient"
import type { User } from "@/lib/types"

interface LeaderPickerProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function LeaderPicker({ value, onChange, required }: LeaderPickerProps) {
  const [leaders, setLeaders] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaders()
  }, [])

  async function loadLeaders() {
    try {
      // Get approved users and filter for Festmitarbeiter/Coordinator
      const users = await apiGet<User[]>("/api/admin/users/approved")
      const eligibleLeaders = users.filter((u) => u.role === "Festmitarbeiter" || u.role === "Coordinator")
      setLeaders(eligibleLeaders)
    } catch (error) {
      console.warn("API not available, using mock data:", error)
      // Mock data for development
      setLeaders([
        { id: "1", firstname: "Max", lastname: "Mustermann", role: "Festmitarbeiter" },
        { id: "2", firstname: "Anna", lastname: "Schmidt", role: "Coordinator" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Assign Leader {required && <span className="text-destructive">*</span>}</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading..." : "Select a leader"} />
        </SelectTrigger>
        <SelectContent>
          {leaders.map((leader) => (
            <SelectItem key={leader.id} value={leader.id}>
              {leader.firstname} {leader.lastname} ({leader.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
