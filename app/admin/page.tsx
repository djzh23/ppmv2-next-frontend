"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { UserTable } from "@/components/user-table"
import { apiGet, apiPut } from "@/lib/apiClient"
import type { User } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { Users, Clock, CheckCircle, XCircle, LogOut } from "lucide-react"

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
        title: "Fehler beim Laden",
        description:
          error instanceof Error ? error.message : "Benutzer konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleApprove(userId: string) {
    setIsLoading(true)
    try {
      await apiPut(AdminEndpoints.approve(userId), {})
      toast({ title: "Benutzer genehmigt", description: "Der Benutzer wurde erfolgreich genehmigt." })
      await loadUsers()
    } catch (error) {
      toast({ title: "Fehler", description: error instanceof Error ? error.message : "Fehler beim Genehmigen", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  async function handleReject(userId: string) {
    setIsLoading(true)
    try {
      await apiPut(AdminEndpoints.reject(userId), {})
      toast({ title: "Benutzer abgelehnt" })
      await loadUsers()
    } catch (error) {
      toast({ title: "Fehler", description: error instanceof Error ? error.message : "Fehler beim Ablehnen", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  async function handleAssignRole(userId: string, role: string) {
    setIsLoading(true)
    try {
      await apiPut(AdminEndpoints.assignRole(userId), { role })
      toast({ title: "Rolle zugewiesen", description: `Rolle "${role}" wurde erfolgreich zugewiesen.` })
      await loadUsers()
    } catch (error) {
      toast({ title: "Fehler", description: error instanceof Error ? error.message : "Fehler beim Zuweisen", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const statCards = [
    {
      label: "Gesamt",
      value: counts.pending + counts.approved + counts.rejected,
      icon: Users,
      color: "hsl(var(--foreground))",
      bg: "hsl(var(--secondary))",
    },
    {
      label: "Ausstehend",
      value: counts.pending,
      icon: Clock,
      color: "#b45309",
      bg: "#fef9c3",
    },
    {
      label: "Genehmigt",
      value: counts.approved,
      icon: CheckCircle,
      color: "#166534",
      bg: "#dcfce7",
    },
    {
      label: "Abgelehnt",
      value: counts.rejected,
      icon: XCircle,
      color: "#991b1b",
      bg: "#fee2e2",
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>

      {/* Header */}
      <header
        style={{
          borderBottom: "0.5px solid hsl(var(--border))",
          backgroundColor: "hsl(var(--background))",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container mx-auto px-6"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "hsl(var(--foreground))",
              }}
            >
              Einsätze
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                letterSpacing: "0.05em",
              }}
            >
              / Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            disabled={isLoading}
            style={{ gap: "0.4rem", fontSize: "0.8rem" }}
          >
            <LogOut style={{ width: "14px", height: "14px" }} />
            Abmelden
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">

        {/* Seitenüberschrift */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "hsl(var(--foreground))",
              margin: 0,
            }}
          >
            Benutzerverwaltung
          </h1>
          <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
            Registrierungen prüfen, Rollen zuweisen und Zugänge verwalten
          </p>
        </div>

        {/* Stat-Karten */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginBottom: "2rem",
          }}
        >
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: "16px", height: "16px", color }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    color: "hsl(var(--foreground))",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "hsl(var(--muted-foreground))",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs-Card */}
        <Card>
          <CardHeader>
            <CardTitle>Benutzerübersicht</CardTitle>
            <CardDescription>
              Ausstehende Registrierungen bearbeiten und genehmigte Benutzer verwalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Ausstehend{counts.pending > 0 && ` (${counts.pending})`}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Genehmigt{counts.approved > 0 && ` (${counts.approved})`}
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Abgelehnt{counts.rejected > 0 && ` (${counts.rejected})`}
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
                <UserTable
                  users={rejectedUsers}
                  showActions={false}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}