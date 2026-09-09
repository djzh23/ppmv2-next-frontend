"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { apiGet } from "@/lib/apiClient"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"

interface LeaderPickerProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function LeaderPicker({ value, onChange, required }: LeaderPickerProps) {
  const { toast } = useToast()
  const [leaders, setLeaders] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaders()
  }, [])

  async function loadLeaders() {
    try {
      const users = await apiGet<User[]>("/api/admin/users/approved")
      const eligibleLeaders = users.filter((u) => u.role === "Festmitarbeiter" || u.role === "Coordinator")
      setLeaders(eligibleLeaders)
    } catch (error) {
      toast({
        title: "Fehler beim Laden der Leader",
        description: error instanceof Error ? error.message : "Die Liste der verfügbaren Leader konnte nicht geladen werden.",
        variant: "destructive",
      })
      setLeaders([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        Leader zuweisen {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading || leaders.length === 0}>
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading
                ? "Laden..."
                : leaders.length === 0
                ? "Keine Leader verfügbar"
                : "Leader auswählen"
            }
          />
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
