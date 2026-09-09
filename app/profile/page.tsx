"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/apiClient"
import { getAuthUser } from "@/lib/auth"
import type { UserProfile } from "@/lib/types"
import { UserRoleBadge } from "@/components/user-role-badge"
import { ArrowLeft, User } from "lucide-react"

export default function ProfilePage() {
  return (
    <RoleGuard allowedRoles={["Admin", "Coordinator", "Festmitarbeiter", "Honorarkraft"]}>
      <ProfileContent />
    </RoleGuard>
  )
}

function ProfileContent() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [endpointMissing, setEndpointMissing] = useState(false)

  const authUser = getAuthUser()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const data = await apiGet<UserProfile>("/api/users/me")
      setProfile(data)
    } catch (error: unknown) {
      // 404 means the endpoint isn't implemented yet on the backend
      if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 404) {
        setEndpointMissing(true)
      }
      // For any other error, endpointMissing stays false — the error UI will show
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DashboardHeader section="Profil" isLoading />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
        <DashboardFooter />
      </div>
    )
  }

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

      <DashboardHeader section="Profil" />

      <main
        className="container mx-auto px-6 py-8"
        style={{ position: "relative", zIndex: 1, flex: 1, maxWidth: "640px" }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
          style={{ gap: "0.4rem", fontSize: "0.85rem" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>

        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "hsl(var(--foreground))",
              margin: 0,
            }}
          >
            Mein Profil
          </h1>
          <p style={{ fontSize: "0.83rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
            Deine Kontodaten
          </p>
        </div>

        {endpointMissing ? (
          // Graceful fallback: show what's available from localStorage
          <Card>
            <CardHeader>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "hsl(var(--secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <User style={{ width: "20px", height: "20px", color: "hsl(var(--muted-foreground))" }} />
              </div>
              <CardTitle style={{ fontSize: "1rem" }}>Kontodaten</CardTitle>
              <CardDescription style={{ fontSize: "0.8rem" }}>
                Vollständige Profildaten sind verfügbar sobald{" "}
                <code style={{ fontSize: "0.75rem" }}>GET /api/users/me</code> im Backend implementiert ist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <ProfileField label="E-Mail" value={authUser?.email ?? ""} />
                <ProfileField label="Rolle" value={authUser?.role ?? ""} />
              </div>
            </CardContent>
          </Card>
        ) : profile ? (
          <Card>
            <CardHeader>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "hsl(var(--secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <User style={{ width: "20px", height: "20px", color: "hsl(var(--muted-foreground))" }} />
              </div>
              <CardTitle style={{ fontSize: "1rem" }}>
                {profile.firstname} {profile.lastname}
              </CardTitle>
              <CardDescription style={{ fontSize: "0.8rem" }}>{profile.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <ProfileField label="Vorname" value={profile.firstname} />
                <ProfileField label="Nachname" value={profile.lastname} />
                <ProfileField label="E-Mail" value={profile.email} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    Rolle
                  </span>
                  <UserRoleBadge role={profile.role} />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
                Profildaten konnten nicht geladen werden.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <DashboardFooter />
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.9rem",
          color: "hsl(var(--foreground))",
          padding: "0.5rem 0.75rem",
          backgroundColor: "hsl(var(--secondary))",
          borderRadius: "calc(var(--radius) - 2px)",
          border: "0.5px solid hsl(var(--border))",
        }}
      >
        {value}
      </span>
    </div>
  )
}
