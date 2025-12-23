"use client"

import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserRoleBadge } from "@/components/user-role-badge"
import { AssignRoleDialog } from "@/components/assign-role-dialog"
import { roleToName } from "@/lib/roles"

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
      <div className="text-center py-12 text-muted-foreground">
        <p>No users found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {(showActions || showRoleAssignment) && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const roleLabel = roleToName(user.role)

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstname} {user.lastname}
                </TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>

                {(showActions || showRoleAssignment) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {showRoleAssignment && onAssignRole && (
                        <AssignRoleDialog user={user} onAssignRole={onAssignRole} isLoading={isLoading} />
                      )}

                      {showActions && onApprove && (
                        <Button size="sm" onClick={() => onApprove(user.id)} disabled={isLoading}>
                          Approve
                        </Button>
                      )}

                      {showActions && onReject && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(user.id)}
                          disabled={isLoading}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
