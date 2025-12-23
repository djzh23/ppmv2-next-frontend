"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { UserTable } from "@/components/user-table"
import { apiGet, apiPut } from "@/lib/apiClient"
import type { User } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"

const AdminEndpoints = {
  pending: "/api/admin/users/pending",
  approved: "/api/admin/users/approved",
  rejected: "/api/admin/users/rejected",

  approve: (id: string) => `/api/admin/users/approve/${id}`,
  reject: (id: string) => `/api/admin/users/reject/${id}`,
  assignRole: (id: string) => `/api/admin/users/${id}/role`,
} as const

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <AdminPageContent />
    </RoleGuard>
  )
}

function AdminPageContent() {
  const { toast } = useToast()

  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [approvedUsers, setApprovedUsers] = useState<User[]>([])
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const counts = useMemo(
    () => ({
      pending: pendingUsers.length,
      approved: approvedUsers.length,
      rejected: rejectedUsers.length,
    }),
    [pendingUsers.length, approvedUsers.length, rejectedUsers.length]
  )

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const [pending, approved, rejected] = await Promise.all([
        apiGet<User[]>(AdminEndpoints.pending),
        apiGet<User[]>(AdminEndpoints.approved),
        apiGet<User[]>(AdminEndpoints.rejected),
      ])

      setPendingUsers(pending ?? [])
      setApprovedUsers(approved ?? [])
      setRejectedUsers(rejected ?? [])
    } catch (error) {
      toast({
        title: "Error loading users",
        description: error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function handleApprove(userId: string) {
    setIsLoading(true)
    try {
      // Backend: PUT /api/admin/users/{id}/approve
      await apiPut(AdminEndpoints.approve(userId), {}) // {} to be safe with some servers
      toast({
        title: "User approved",
        description: "The user has been approved successfully.",
      })
      await loadUsers()
    } catch (error) {
      toast({
        title: "Error approving user",
        description: error instanceof Error ? error.message : "Failed to approve user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleReject(userId: string) {
    setIsLoading(true)
    try {
      // Backend: PUT /api/admin/users/{id}/reject
      await apiPut(AdminEndpoints.reject(userId), {})
      toast({
        title: "User rejected",
        description: "The user has been rejected.",
      })
      await loadUsers()
    } catch (error) {
      toast({
        title: "Error rejecting user",
        description: error instanceof Error ? error.message : "Failed to reject user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAssignRole(userId: string, role: string) {
    setIsLoading(true)
    try {
      // Backend: PUT /api/admin/users/{id}/assign-role
      // Payload assumed: { role: "Admin" | "Coordinator" | "Festmitarbeiter" | "Honorarkraft" }
      await apiPut(AdminEndpoints.assignRole(userId), { role })

      toast({
        title: "Role assigned",
        description: `Role "${role}" has been assigned successfully.`,
      })

      await loadUsers()
    } catch (error) {
      toast({
        title: "Error assigning role",
        description: error instanceof Error ? error.message : "Failed to assign role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage user approvals and roles</p>
          </div>

          <Button variant="outline" onClick={logout} disabled={isLoading}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Review and approve user registrations</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending {counts.pending > 0 && `(${counts.pending})`}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved {counts.approved > 0 && `(${counts.approved})`}
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected {counts.rejected > 0 && `(${counts.rejected})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <UserTable
                  users={pendingUsers}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                <UserTable
                  users={approvedUsers}
                  showActions={false}
                  showRoleAssignment={true}
                  onAssignRole={handleAssignRole}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="rejected" className="mt-6">
                <UserTable users={rejectedUsers} showActions={false} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
