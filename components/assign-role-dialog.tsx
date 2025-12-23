"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { User } from "@/lib/types"
import { roleToName } from "@/lib/roles"

type RoleName = "Admin" | "Coordinator" | "Festmitarbeiter" | "Honorarkraft"

const ROLE_OPTIONS: RoleName[] = ["Admin", "Coordinator", "Festmitarbeiter", "Honorarkraft"]

function normalizeToRoleName(value: unknown): RoleName | "" {
  // Accept:
  // - "Admin"
  // - 1 / "1" (mapped via roleToName)
  // - any other string -> ""
  const name = roleToName(value)

  if (ROLE_OPTIONS.includes(name as RoleName)) {
    return name as RoleName
  }

  return ""
}

interface AssignRoleDialogProps {
  user: User
  onAssignRole: (userId: string, role: string) => void
  isLoading?: boolean
}

export function AssignRoleDialog({ user, onAssignRole, isLoading }: AssignRoleDialogProps) {
  const [open, setOpen] = useState(false)

  // Derive the initial role from user.role (supports number, "1", or "Admin")
  const initialRole = useMemo(() => normalizeToRoleName(user.role), [user.role])

  const [selectedRole, setSelectedRole] = useState<RoleName | "">(initialRole)

  // If the dialog is opened later and user.role changed (after refresh),
  // keep the selection in sync (only when opening / or when value changes).
  useEffect(() => {
    if (!open) {
      setSelectedRole(initialRole)
    }
  }, [initialRole, open])

  const handleSubmit = () => {
    if (!selectedRole) return
    onAssignRole(user.id, selectedRole)
    setOpen(false)
  }

  const buttonLabel = initialRole ? "Change Role" : "Assign Role"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {buttonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            Assign a role to {user.firstname} {user.lastname}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>

            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleName)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Coordinator">Coordinator</SelectItem>
                <SelectItem value="Festmitarbeiter">Festmitarbeiter</SelectItem>
                <SelectItem value="Honorarkraft">Honorarkraft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedRole || isLoading}>
            Assign Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
