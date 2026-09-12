"use client"

import { useState, useEffect } from "react"
import type { LocationDetail, CreateLocationRequest, UpdateLocationRequest } from "@/lib/types"
import { apiPost, apiPut, ApiError } from "@/lib/apiClient"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface LocationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editLocation?: LocationDetail | null
  onSuccess: (saved?: LocationDetail) => void
}

export function LocationFormDialog({ open, onOpenChange, editLocation, onSuccess }: LocationFormDialogProps) {
  const isEdit = !!editLocation

  const emptyForm: CreateLocationRequest = {
    name: "",
    district: "",
    address: "",
    description: "",
    photoUrl: "",
    contactPerson: "",
    capacity: undefined,
    notes: "",
  }

  const [form, setForm] = useState<CreateLocationRequest>(emptyForm)
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; district?: string }>({})

  useEffect(() => {
    if (open) {
      if (editLocation) {
        setForm({
          name: editLocation.name,
          district: editLocation.district,
          address: editLocation.address ?? "",
          description: editLocation.description ?? "",
          photoUrl: editLocation.photoUrl ?? "",
          contactPerson: editLocation.contactPerson ?? "",
          capacity: editLocation.capacity,
          notes: editLocation.notes ?? "",
        })
        setIsActive(editLocation.isActive)
      } else {
        setForm(emptyForm)
        setIsActive(true)
      }
      setError(null)
      setFieldErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editLocation])

  function set(field: keyof CreateLocationRequest, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const errs: { name?: string; district?: string } = {}
    if (!form.name.trim()) errs.name = "Name ist erforderlich"
    if (!form.district.trim()) errs.district = "Bezirk ist erforderlich"
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    try {
      let saved: LocationDetail
      if (isEdit && editLocation) {
        const payload: UpdateLocationRequest = {
          name: form.name.trim(),
          district: form.district.trim(),
          address: form.address?.trim() || undefined,
          description: form.description?.trim() || undefined,
          photoUrl: form.photoUrl?.trim() || undefined,
          contactPerson: form.contactPerson?.trim() || undefined,
          capacity: form.capacity,
          notes: form.notes?.trim() || undefined,
          isActive,
        }
        saved = await apiPut<LocationDetail>(`/api/locations/${editLocation.id}`, payload)
      } else {
        const payload: CreateLocationRequest = {
          name: form.name.trim(),
          district: form.district.trim(),
          address: form.address?.trim() || undefined,
          description: form.description?.trim() || undefined,
          photoUrl: form.photoUrl?.trim() || undefined,
          contactPerson: form.contactPerson?.trim() || undefined,
          capacity: form.capacity,
          notes: form.notes?.trim() || undefined,
        }
        saved = await apiPost<LocationDetail>("/api/locations", payload)
      }
      onSuccess(saved)
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiError) {
        const detail = err.details ? ` — ${JSON.stringify(err.details)}` : ""
        setError(`HTTP ${err.status}: ${err.message}${detail}`)
      } else {
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Unterkunft bearbeiten" : "Neue Unterkunft"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.25rem" }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="loc-name">Name *</Label>
              <Input
                id="loc-name"
                value={form.name}
                onChange={(e) => { set("name", e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })) }}
                placeholder="z. B. Sportheim Nord"
                style={fieldErrors.name ? { borderColor: "hsl(var(--destructive))" } : undefined}
              />
              {fieldErrors.name && (
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--destructive))" }}>{fieldErrors.name}</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="loc-district">Bezirk *</Label>
              <Input
                id="loc-district"
                value={form.district}
                onChange={(e) => { set("district", e.target.value); setFieldErrors((p) => ({ ...p, district: undefined })) }}
                placeholder="z. B. Mitte"
                style={fieldErrors.district ? { borderColor: "hsl(var(--destructive))" } : undefined}
              />
              {fieldErrors.district && (
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--destructive))" }}>{fieldErrors.district}</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label htmlFor="loc-address">Adresse</Label>
            <Input
              id="loc-address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Straße, Hausnummer, PLZ Ort"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="loc-contact">Ansprechperson</Label>
              <Input
                id="loc-contact"
                value={form.contactPerson}
                onChange={(e) => set("contactPerson", e.target.value)}
                placeholder="Name"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="loc-capacity">Kapazität</Label>
              <Input
                id="loc-capacity"
                type="number"
                min={0}
                value={form.capacity ?? ""}
                onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Personen"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label htmlFor="loc-photoUrl">Foto-URL</Label>
            <Input
              id="loc-photoUrl"
              value={form.photoUrl}
              onChange={(e) => set("photoUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label htmlFor="loc-description">Beschreibung</Label>
            <Textarea
              id="loc-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Kurze Beschreibung der Unterkunft"
              rows={3}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label htmlFor="loc-notes">Notizen</Label>
            <Textarea
              id="loc-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Interne Hinweise"
              rows={2}
            />
          </div>

          {isEdit && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius)",
                border: "0.5px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--muted) / 0.4)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Status</div>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                  {isActive ? "Aktiv — steht für Einsätze zur Verfügung" : "Inaktiv — nicht für Einsätze verfügbar"}
                </div>
              </div>
              <Switch
                id="loc-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}

          {error && (
            <p style={{ fontSize: "0.8rem", color: "hsl(var(--destructive))", margin: 0 }}>
              {error}
            </p>
          )}

          <DialogFooter style={{ marginTop: "0.5rem" }}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern…" : isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
