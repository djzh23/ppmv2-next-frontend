"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserRole, isAuthenticated } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, GitBranch, CheckSquare, Inbox } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Rollenbasierter Zugriff",
    sub: "Admin · Koordinator · Festmitarbeiter · Honorarkraft",
  },
  {
    icon: GitBranch,
    title: "Einsatz-Workflow",
    sub: "Entwurf → Geplant → Aktiv → Abgeschlossen",
  },
  {
    icon: CheckSquare,
    title: "Benutzerverwaltung",
    sub: "Registrierung mit Admin-Freigabe und Rollenzuweisung",
  },
  {
    icon: Inbox,
    title: "Leader-Inbox",
    sub: "Zugewiesene Einsätze einsehen und annehmen",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      setChecking(false)
      return
    }
    const role = getUserRole()
    switch (role) {
      case "Admin":
        router.push("/admin")
        break
      case "Coordinator":
        router.push("/coordinator/shifts")
        break
      case "Festmitarbeiter":
        router.push("/festmitarbeiter/inbox")
        break
      case "Honorarkraft":
        router.push("/honorarkraft/inbox")
        break
      default:
        setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <div
          className="animate-spin rounded-full border-b-2"
          style={{ width: "1.5rem", height: "1.5rem", borderColor: "hsl(var(--foreground))" }}
        />
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
        overflow: "hidden",
        backgroundColor: "hsl(var(--background))",
      }}
    >
      {/* Grid-Hintergrund */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: [
            "linear-gradient(rgba(100,100,100,0.1) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(100,100,100,0.1) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Nav */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem clamp(1.5rem, 5vw, 4rem)",
          borderBottom: "0.5px solid hsl(var(--border))",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: "1.05rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "hsl(var(--foreground))",
          }}
        >
          PPM
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Anmelden</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Registrieren</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(3rem, 8vh, 6rem) clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        <div style={{ maxWidth: "680px", width: "100%" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "hsl(var(--muted-foreground))",
              border: "0.5px solid hsl(var(--border))",
              borderRadius: "999px",
              padding: "0.3rem 0.85rem",
              marginBottom: "2rem",
            }}
          >
            Shift Management System
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: "hsl(var(--foreground))",
              marginBottom: "1.25rem",
            }}
          >
            Play Pal Manager
          </h1>

          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
              lineHeight: 1.75,
              color: "hsl(var(--muted-foreground))",
              marginBottom: "2.5rem",
              maxWidth: "520px",
              margin: "0 auto 2.5rem",
            }}
          >
            Zentrales System zur Verwaltung von Einsätzen, Teams und Rollen —
            für Koordinatoren, Leader und Mitarbeiter in einer Anwendung.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "4rem",
            }}
          >
            <Button size="lg" asChild>
              <Link href="/auth/login" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                Anmelden
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">Konto erstellen</Link>
            </Button>
          </div>

          {/* Feature-Karten */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              textAlign: "left",
            }}
          >
            {features.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                style={{
                  backgroundColor: "hsl(var(--card))",
                  border: "0.5px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  padding: "1rem 1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "hsl(var(--secondary))",
                    border: "0.5px solid hsl(var(--border))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: "15px", height: "15px", color: "hsl(var(--foreground))" }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "hsl(var(--foreground))",
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "hsl(var(--muted-foreground))",
                      marginTop: "3px",
                      lineHeight: 1.5,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "0.5px solid hsl(var(--border))",
          padding: "1rem clamp(1.5rem, 5vw, 4rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))" }}>
          PPM – Play Pal Manager · Shift Management System
        </span>
      </footer>
    </div>
  )
}
