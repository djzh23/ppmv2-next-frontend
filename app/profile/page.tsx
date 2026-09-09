"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/apiClient"
import type { UserProfile, Location } from "@/lib/types"
import { UserRoleBadge } from "@/components/user-role-badge"
import { ArrowLeft, MapPin, User } from "lucide-react"

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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [locationsError, setLocationsError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoadError(null)
    try {
      const data = await apiGet<UserProfile>("/api/users/me")
      setProfile(data)
      if (data.role === "Festmitarbeiter") {
        loadLocations()
      }
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : "Profil konnte nicht geladen werden.")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadLocations() {
    setLocationsLoading(true)
    setLocationsError(null)
    try {
      const data = await apiGet<Location[]>("/api/users/me/locations")
      setLocations(data)
    } catch (error: unknown) {
      setLocationsError(error instanceof Error ? error.message : "Standorte konnten nicht geladen werden.")
    } finally {
      setLocationsLoading(false)
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

        {loadError ? (
          <Card>
            <CardContent className="pt-6" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--destructive))", marginBottom: "0.75rem" }}>
                {loadError}
              </p>
              <button
                onClick={loadProfile}
                style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
              >
                Erneut versuchen
              </button>
            </CardContent>
          </Card>
        ) : profile ? (
          <>
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
                  <ProfileField label="Status" value={profile.status} />
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

            {profile.role === "Festmitarbeiter" && (
              <Card style={{ marginTop: "1.5rem" }}>
                <CardHeader>
                  <CardTitle style={{ fontSize: "1rem" }}>Meine Standorte</CardTitle>
                  <CardDescription style={{ fontSize: "0.8rem" }}>Dir zugewiesene Einsatzorte</CardDescription>
                </CardHeader>
                <CardContent>
                  {locationsLoading ? (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>
                      Laden...
                    </div>
                  ) : locationsError ? (
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                      <p style={{ fontSize: "0.85rem", color: "hsl(var(--destructive))", marginBottom: "0.5rem" }}>
                        {locationsError}
                      </p>
                      <button
                        onClick={loadLocations}
                        style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  ) : locations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "hsl(var(--muted-foreground))", fontSize: "0.85rem" }}>
                      Keine Standorte zugewiesen
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {locations.map((loc) => (
                        <div
                          key={loc.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "calc(var(--radius) - 2px)",
                            border: "0.5px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--secondary))",
                          }}
                        >
                          <MapPin style={{ width: "14px", height: "14px", color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "hsl(var(--foreground))", margin: 0 }}>
                              {loc.name}
                            </p>
                            {loc.district && (
                              <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", margin: 0 }}>
                                {loc.district}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
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
