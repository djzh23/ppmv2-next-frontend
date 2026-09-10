"use client"

import { useState, useEffect } from "react"
import type { LocationDetail, CreateLocationRequest } from "@/lib/types"
import { apiPost, apiPut } from "@/lib/apiClient"
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

interface LocationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editLocation?: LocationDetail | null
  onSuccess: () => void
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      } else {
        setForm(emptyForm)
      }
      setError(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editLocation])

  function set(field: keyof CreateLocationRequest, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

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

    setIsSubmitting(true)
    try {
      if (isEdit && editLocation) {
        await apiPut<LocationDetail>(`/api/locations/${editLocation.id}`, payload)
      } else {
        await apiPost<LocationDetail>("/api/locations", payload)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "520px" }}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Unterkunft bearbeiten" : "Neue Unterkunft"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="loc-name">Name *</Label>
              <Input
                id="loc-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="z. B. Sportheim Nord"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="loc-district">Bezirk *</Label>
              <Input
                id="loc-district"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                required
                placeholder="z. B. Mitte"
              />
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
