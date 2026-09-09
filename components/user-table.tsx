"use client"

import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserRoleBadge } from "@/components/user-role-badge"
import { AssignRoleDialog } from "@/components/assign-role-dialog"
import { Users } from "lucide-react"

interface UserTableProps {
  users: User[]
  onApprove?: (userId: string) => void
  onReject?: (userId: string) => void
  onAssignRole?: (userId: string, role: string) => void
  isLoading?: boolean
  showActions?: boolean
  showRoleAssignment?: boolean
}

export function UserTable({
  users,
  onApprove,
  onReject,
  onAssignRole,
  isLoading,
  showActions = true,
  showRoleAssignment = false,
}: UserTableProps) {

  if (users.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1rem",
          gap: "0.75rem",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <div
          style={{
            width: "44px", height: "44px",
            borderRadius: "12px",
            backgroundColor: "hsl(var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Users style={{ width: "20px", height: "20px", opacity: 0.4 }} />
        </div>
        <p style={{ fontSize: "0.85rem", margin: 0 }}>Keine Benutzer gefunden</p>
      </div>
    )
  }

  return (
    <div
      style={{
        border: "0.5px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHeader>
          <TableRow
            style={{ backgroundColor: "hsl(var(--secondary))" }}
          >
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "hsl(var(--muted-foreground))", paddingLeft: "1rem" }}>
              NAME
            </TableHead>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "hsl(var(--muted-foreground))" }}>
              E-MAIL
            </TableHead>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "hsl(var(--muted-foreground))" }}>
              ROLLE
            </TableHead>
            {(showActions || showRoleAssignment) && (
              <TableHead style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "hsl(var(--muted-foreground))", textAlign: "right", paddingRight: "1rem" }}>
                AKTIONEN
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, idx) => (
            <TableRow
              key={user.id}
              style={{
                backgroundColor: idx % 2 === 0 ? "transparent" : "hsl(var(--secondary) / 0.4)",
                borderBottom: idx === users.length - 1 ? "none" : undefined,
              }}
            >
              <TableCell
                style={{ fontWeight: 500, fontSize: "0.85rem", paddingLeft: "1rem", color: "hsl(var(--foreground))" }}
              >
                {user.firstname} {user.lastname}
              </TableCell>
              <TableCell style={{ fontSize: "0.83rem", color: "hsl(var(--muted-foreground))" }}>
                {user.email}
              </TableCell>
              <TableCell>
                <UserRoleBadge role={user.role} />
              </TableCell>
              {(showActions || showRoleAssignment) && (
                <TableCell style={{ textAlign: "right", paddingRight: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    {showRoleAssignment && onAssignRole && (
                      <AssignRoleDialog user={user} onAssignRole={onAssignRole} isLoading={isLoading} />
                    )}
                    {showActions && onApprove && (
                      <Button
                        size="sm"
                        onClick={() => onApprove(user.id)}
                        disabled={isLoading}
                        style={{
                          height: "30px",
                          fontSize: "0.75rem",
                          backgroundColor: "#15803d",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0 10px",
                          gap: "4px",
                        }}
                      >
                        Genehmigen
                      </Button>
                    )}
                    {showActions && onReject && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(user.id)}
                        disabled={isLoading}
                        style={{
                          height: "30px",
                          fontSize: "0.75rem",
                          borderColor: "#fca5a5",
                          color: "#b91c1c",
                          borderRadius: "6px",
                          padding: "0 10px",
                          gap: "4px",
                        }}
                      >
                        Ablehnen
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}