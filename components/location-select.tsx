"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { apiGet } from "@/lib/apiClient"
import type { Location } from "@/lib/types"

interface LocationSelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function LocationSelect({ value, onChange, required }: LocationSelectProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    try {
      const data = await apiGet<Location[]>("/api/locations")
      setLocations(data)
    } catch (error) {
      console.warn("API not available, using empty list:", error)
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Location {required && <span className="text-destructive">*</span>}</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading..." : "Select a location"} />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
