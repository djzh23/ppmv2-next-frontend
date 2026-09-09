"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { UserTable } from "@/components/user-table"
import { apiGet, apiPut } from "@/lib/apiClient"
import type { User } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Users, Clock, CheckCircle, XCircle } from "lucide-react"

const AdminEndpoints = {
  pending:    "/api/admin/users/pending",
  approved:   "/api/admin/users/approved",
  rejected:   "/api/admin/users/rejected",
  approve:    (id: string) => `/api/admin/users/approve/${id}`,
  reject:     (id: string) => `/api/admin/users/reject/${id}`,
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
  const [pendingUsers,  setPendingUsers]  = useState<User[]>([])
  const [approvedUsers, setApprovedUsers] = useState<User[]>([])
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const counts = useMemo(() => ({
    pending:  pendingUsers.length,
    approved: approvedUsers.length,
    rejected: rejectedUsers.length,
  }), [pendingUsers.length, approvedUsers.length, rejectedUsers.length])

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const [pending, approved, rejected] = await Promise.all([
        apiGet<User[]>(AdminEndpoints.pending),
        apiGet<User[]>(AdminEndpoints.approved),
        apiGet<User[]>(AdminEndpoints.rejected),
      ])
      setPendingUsers(pending  ?? [])
      setApprovedUsers(approved ?? [])
      setRejectedUsers(rejected ?? [])
    } catch (error) {
      toast({ title: "Fehler beim Laden", description: error instanceof Error ? error.message : "Unbekannter Fehler", variant: "destructive" })
    } finally { setIsLoading(false) }
  }, [toast])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleApprove(userId: string) {
    setIsLoading(true)
    try {
      await apiPut(AdminEndpoints.approve(userId), {})
      toast({ title: "Benutzer genehmigt" })
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
    { label: "Gesamt",     value: counts.pending + counts.approved + counts.rejected, icon: Users,       accent: "#f1f5f9", iconColor: "#64748b" },
    { label: "Ausstehend", value: counts.pending,  icon: Clock,        accent: "#fef9c3", iconColor: "#a16207" },
    { label: "Genehmigt",  value: counts.approved, icon: CheckCircle,  accent: "#dcfce7", iconColor: "#15803d" },
    { label: "Abgelehnt",  value: counts.rejected, icon: XCircle,      accent: "#fee2e2", iconColor: "#b91c1c" },
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "hsl(var(--background))",
        overflow: "hidden",
      }}
    >
      {/* ── Hintergrund-Grid ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: [
            "linear-gradient(rgba(100,100,100,0.07) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(100,100,100,0.07) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <DashboardHeader section="Admin" isLoading={isLoading} />

      {/* Main */}
      <main
        className="container mx-auto px-6 py-8"
        style={{ position: "relative", zIndex: 1, flex: 1 }}
      >
        {/* Seitenkopf */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", margin: 0 }}>
            Benutzerverwaltung
          </h1>
          <p style={{ fontSize: "0.83rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
            Registrierungen prüfen, Rollen zuweisen und Zugänge verwalten
          </p>
        </div>

        {/* Stat-Karten */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "2rem" }}>
          {statCards.map(({ label, value, icon: Icon, accent, iconColor }) => (
            <div
              key={label}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "1rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.9rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: "17px", height: "17px", color: iconColor }} />
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}>
                  {value}
                </div>
                <div style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))", marginTop: "3px", letterSpacing: "0.01em" }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Haupt-Card */}
        <Card style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <CardHeader style={{ paddingBottom: "1rem" }}>
            <CardTitle style={{ fontSize: "1rem", fontWeight: 600 }}>Benutzerübersicht</CardTitle>
            <CardDescription style={{ fontSize: "0.8rem" }}>
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

              <TabsContent value="pending" className="mt-5">
                <UserTable users={pendingUsers} onApprove={handleApprove} onReject={handleReject} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="approved" className="mt-5">
                <UserTable users={approvedUsers} showActions={false} showRoleAssignment={true} onAssignRole={handleAssignRole} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="rejected" className="mt-5">
                <UserTable users={rejectedUsers} showActions={false} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}