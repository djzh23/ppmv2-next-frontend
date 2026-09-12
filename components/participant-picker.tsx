"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiGet } from "@/lib/apiClient"
import type { AvailableStaff, ParticipantRole } from "@/lib/types"

interface Participant {
  userId: string
  role: ParticipantRole
}

interface ParticipantPickerProps {
  locationId: string
  date: string // YYYY-MM-DD
  value: Participant[]
  onChange: (participants: Participant[]) => void
}

export function ParticipantPicker({ locationId, date, value, onChange }: ParticipantPickerProps) {
  const [staff, setStaff] = useState<AvailableStaff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const canLoad = !!locationId && !!date

  useEffect(() => {
    if (!canLoad) {
      setStaff([])
      onChange([])
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
      // Remove participants who are no longer available
      const availableIds = new Set(data.map((s) => s.userId))
      onChange(value.filter((p) => availableIds.has(p.userId)))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Mitarbeiter konnten nicht geladen werden.")
      setStaff([])
    } finally {
      setIsLoading(false)
    }
  }

  function isSelected(userId: string): boolean {
    return value.some((p) => p.userId === userId)
  }

  function getRole(userId: string): ParticipantRole {
    return value.find((p) => p.userId === userId)?.role ?? "Member"
  }

  function hasLeader(): boolean {
    return value.some((p) => p.role === "Leader")
  }

  function toggleParticipant(userId: string) {
    if (isSelected(userId)) {
      onChange(value.filter((p) => p.userId !== userId))
    } else {
      const defaultRole: ParticipantRole = !hasLeader() ? "Leader" : "Member"
      onChange([...value, { userId, role: defaultRole }])
    }
  }

  function updateRole(userId: string, role: ParticipantRole) {
    onChange(value.map((p) => (p.userId === userId ? { ...p, role } : p)))
  }

  const selectedCount = value.length
  const leaderCount = value.filter((p) => p.role === "Leader").length

  return (
    <div className="space-y-2">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Label>
          Team zuweisen <span className="text-destructive">*</span>
        </Label>
        {selectedCount > 0 && (
          <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
            {selectedCount} ausgewählt
          </span>
        )}
      </div>

      {!canLoad && (
        <p style={{ fontSize: "0.82rem", color: "hsl(var(--muted-foreground))", padding: "0.5rem 0" }}>
          Zuerst Standort und Datum wählen.
        </p>
      )}

      {canLoad && isLoading && (
        <p style={{ fontSize: "0.82rem", color: "hsl(var(--muted-foreground))", padding: "0.5rem 0" }}>
          Lade verfügbare Mitarbeiter...
        </p>
      )}

      {canLoad && !isLoading && loadError && (
        <p style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", marginTop: "0.25rem" }}>
          {loadError}{" "}
          <button
            type="button"
            onClick={loadStaff}
            style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit" }}
          >
            Erneut versuchen
          </button>
        </p>
      )}

      {canLoad && !isLoading && !loadError && staff.length === 0 && (
        <p style={{ fontSize: "0.82rem", color: "hsl(var(--muted-foreground))", padding: "0.5rem 0" }}>
          Keine verfügbaren Mitarbeiter für diesen Standort und Tag.
        </p>
      )}

      {canLoad && !isLoading && staff.length > 0 && (
        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {staff.map((s, i) => {
            const selected = isSelected(s.userId)
            const role = getRole(s.userId)
            return (
              <div
                key={s.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.85rem",
                  borderTop: i > 0 ? "1px solid hsl(var(--border))" : undefined,
                  backgroundColor: selected ? "hsl(var(--accent) / 0.4)" : "transparent",
                  transition: "background-color 0.1s",
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleParticipant(s.userId)}
                  style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }}
                />

                {/* Name + Role label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: selected ? 500 : 400,
                      color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.firstname} {s.lastname}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))" }}>
                    {s.role}
                  </span>
                </div>

                {/* Role Select */}
                <div style={{ flexShrink: 0, opacity: selected ? 1 : 0.35, pointerEvents: selected ? "auto" : "none" }}>
                  <Select
                    value={role}
                    onValueChange={(v) => updateRole(s.userId, v as ParticipantRole)}
                    disabled={!selected}
                  >
                    <SelectTrigger style={{ height: "30px", fontSize: "0.78rem", minWidth: "100px" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leader">Leader</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Leader warning */}
      {selectedCount > 0 && leaderCount === 0 && (
        <p style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", marginTop: "0.25rem" }}>
          Bitte mindestens einen Leader auswählen.
        </p>
      )}
    </div>
  )
}
