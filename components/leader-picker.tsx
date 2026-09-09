"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { apiGet } from "@/lib/apiClient"
import type { AvailableStaff } from "@/lib/types"

interface LeaderPickerProps {
  value: string
  onChange: (value: string) => void
  locationId: string
  date: string // YYYY-MM-DD
  required?: boolean
}

export function LeaderPicker({ value, onChange, locationId, date, required }: LeaderPickerProps) {
  const [staff, setStaff] = useState<AvailableStaff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const canLoad = !!locationId && !!date

  useEffect(() => {
    if (!canLoad) {
      setStaff([])
      return
    }
    loadStaff()
  }, [locationId, date])

  async function loadStaff() {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await apiGet<AvailableStaff[]>(
        `/api/locations/${locationId}/available-staff?date=${date}`
      )
      setStaff(data)
      // Reset selection if the previously selected person is no longer available
      if (value && !data.some((s) => s.userId === value)) {
        onChange("")
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Mitarbeiter konnten nicht geladen werden.")
      setStaff([])
    } finally {
      setIsLoading(false)
    }
  }

  const placeholder = !canLoad
    ? "Zuerst Standort und Datum wählen"
    : isLoading
    ? "Laden..."
    : staff.length === 0
    ? "Keine Mitarbeiter verfügbar"
    : "Leader auswählen"

  return (
    <div className="space-y-2">
      <Label>
        Leader zuweisen {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={!canLoad || isLoading || staff.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {staff.map((s) => (
            <SelectItem key={s.userId} value={s.userId}>
              {s.firstname} {s.lastname} ({s.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loadError && (
        <p style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", marginTop: "0.25rem" }}>
          {loadError} —{" "}
          <button
            type="button"
            onClick={loadStaff}
            style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit" }}
          >
            Erneut versuchen
          </button>
        </p>
      )}
    </div>
  )
}
