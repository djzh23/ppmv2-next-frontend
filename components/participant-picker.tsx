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
  startDate: string  // YYYY-MM-DD
  startTime: string  // HH:mm
  endDate: string    // YYYY-MM-DD
  endTime: string    // HH:mm
  value: Participant[]
  onChange: (participants: Participant[]) => void
}

export function ParticipantPicker({ startDate, startTime, endDate, endTime, value, onChange }: ParticipantPickerProps) {
  const [staff, setStaff] = useState<AvailableStaff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const canLoad = !!startDate && !!startTime && !!endDate && !!endTime

  useEffect(() => {
    if (!canLoad) {
      setStaff([])
      return
    }
    loadStaff()
  }, [startDate, startTime, endDate, endTime])

  async function loadStaff() {
    setIsLoading(true)
    setLoadError(null)
    try {
      const startAt = new Date(`${startDate}T${startTime}`).toISOString()
      const endAt = new Date(`${endDate}T${endTime}`).toISOString()
      const data = await apiGet<AvailableStaff[]>(
        `/api/users/staff?startAt=${encodeURIComponent(startAt)}&endAt=${encodeURIComponent(endAt)}`
      )
      setStaff(data)
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
          Zuerst Start- und Enddatum/-zeit wählen.
        </p>
      )}

      {canLoad && isLoading && (
        <p style={{ fontSize: "0.82rem", color: "hsl(var(--muted-foreground))", padding: "0.5rem 0" }}>
          Lade Mitarbeiter...
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
          Keine Mitarbeiter gefunden.
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

                {/* Name + Role label + conflict badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: selected ? 500 : 400,
                        color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.firstname} {s.lastname}
                    </span>
                    {s.hasConflict && (
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 500,
                        padding: "0.05rem 0.35rem",
                        borderRadius: "9999px",
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fcd34d",
                        whiteSpace: "nowrap",
                      }}>
                        Bereits eingeteilt
                      </span>
                    )}
                  </div>
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

      {/* Validation hints */}
      {selectedCount > 0 && leaderCount === 0 && (
        <p style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", marginTop: "0.25rem" }}>
          Bitte mindestens einen Leader auswählen.
        </p>
      )}
      {selectedCount > 0 && leaderCount > 1 && (
        <p style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", marginTop: "0.25rem" }}>
          Nur ein Leader pro Einsatz erlaubt.
        </p>
      )}
    </div>
  )
}
