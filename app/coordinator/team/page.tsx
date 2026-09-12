"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { apiGet } from "@/lib/apiClient"
import type { StaffMember } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"

export default function CoordinatorTeamPage() {
  return (
    <RoleGuard allowedRoles={["Coordinator", "Admin"]}>
      <CoordinatorTeamContent />
    </RoleGuard>
  )
}

function roleLabel(role: string): string {
  if (role === "Festmitarbeiter") return "Festmitarbeiter"
  if (role === "Honorarkraft") return "Honorarkraft"
  return role
}

function roleColor(role: string): { color: string; bg: string } {
  if (role === "Festmitarbeiter") return { color: "#166534", bg: "#dcfce7" }
  return { color: "#92400e", bg: "#fef3c7" }
}

function CoordinatorTeamContent() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await apiGet<StaffMember[]>("/api/users/staff")
      setStaff(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Team konnte nicht geladen werden.")
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = staff.filter((s) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      s.firstname.toLowerCase().includes(q) ||
      s.lastname.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.locations.some((l) => l.name.toLowerCase().includes(q) || l.district.toLowerCase().includes(q))
    )
  })

  const festCount = staff.filter((s) => s.role === "Festmitarbeiter").length
  const honCount = staff.filter((s) => s.role === "Honorarkraft").length

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

      <DashboardHeader section="Team" isLoading={isLoading} />

      <main className="container mx-auto px-6 py-8" style={{ flex: 1, position: "relative", zIndex: 1 }}>

        {loadError && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--destructive) / 0.3)",
              backgroundColor: "hsl(var(--destructive) / 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "0.83rem", color: "hsl(var(--destructive))" }}>{loadError}</span>
            <button
              onClick={loadStaff}
              style={{ fontSize: "0.78rem", color: "hsl(var(--destructive))", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Erneut versuchen
            </button>
          </div>
        )}

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", margin: 0 }}>
            Team
          </h1>
          <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
            Alle freigeschalteten Mitarbeiter und ihre Standorte
          </p>
        </div>

        {/* Stat cards */}
        {!isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "1.5rem" }}>
            {[
              { label: "Gesamt", value: staff.length, color: "#2563eb", bg: "#dbeafe" },
              { label: "Festmitarbeiter", value: festCount, color: "#166534", bg: "#dcfce7" },
              { label: "Honorarkraft", value: honCount, color: "#92400e", bg: "#fef3c7" },
            ].map(({ label, value, color, bg }) => (
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
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users style={{ width: "16px", height: "16px", color }} />
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1, color: "hsl(var(--foreground))" }}>{value}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: "1.5rem", maxWidth: "360px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, Rolle oder Standort suchen..."
            style={{
              width: "100%",
              padding: "0.45rem 0.75rem",
              fontSize: "0.85rem",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              outline: "none",
            }}
          />
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} style={{ height: "56px", borderRadius: "var(--radius)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "hsl(var(--muted-foreground))" }}>
            <Users style={{ width: "40px", height: "40px", margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "0.9rem" }}>
              {staff.length === 0 ? "Noch keine freigeschalteten Mitarbeiter vorhanden." : "Keine Mitarbeiter gefunden."}
            </p>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              backgroundColor: "hsl(var(--card))",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 3fr",
                padding: "0.5rem 1rem",
                backgroundColor: "hsl(var(--muted) / 0.5)",
                borderBottom: "1px solid hsl(var(--border))",
              }}
            >
              {["Name", "Rolle", "Standorte"].map((h) => (
                <span key={h} style={{ fontSize: "0.72rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((s, i) => {
              const { color, bg } = roleColor(s.role)
              return (
                <div
                  key={s.userId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 3fr",
                    padding: "0.75rem 1rem",
                    alignItems: "center",
                    borderTop: i > 0 ? "1px solid hsl(var(--border))" : undefined,
                    gap: "0.5rem",
                  }}
                >
                  {/* Name */}
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "hsl(var(--foreground))" }}>
                    {s.lastname}, {s.firstname}
                  </span>

                  {/* Role badge */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color,
                      backgroundColor: bg,
                      padding: "0.15rem 0.55rem",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {roleLabel(s.role)}
                  </span>

                  {/* Locations */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {s.locations.length === 0 ? (
                      <span style={{ fontSize: "0.78rem", color: "hsl(var(--muted-foreground))" }}>
                        Kein Standort zugewiesen
                      </span>
                    ) : (
                      s.locations.map((l) => (
                        <span
                          key={l.id}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--muted) / 0.4)",
                            color: "hsl(var(--foreground))",
                            whiteSpace: "nowrap",
                          }}
                          title={l.district}
                        >
                          {l.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <DashboardFooter />
    </div>
  )
}
