"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const features = [
  {
    icon: "⬡",
    title: "Rollenbasierter Zugriff",
    sub: "Admin · Koordinator · Leader",
  },
  {
    icon: "→",
    title: "Einsatz-Workflow",
    sub: "Entwurf → Geplant → Aktiv",
  },
  {
    icon: "✓",
    title: "Benutzerverwaltung",
    sub: "Registrierung mit Admin-Freigabe",
  },
  {
    icon: "◫",
    title: "Leader-Inbox",
    sub: "Zuweisungen einsehen und annehmen",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast({ title: "Login erfolgreich", description: "Weiterleitung..." })
      router.push("/")
    } catch (error) {
      toast({
        title: "Login fehlgeschlagen",
        description:
          error instanceof Error ? error.message : "Ungültige Anmeldedaten",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex p-4"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "hsl(var(--background))",
      }}
    >
      {/* Grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: [
            "linear-gradient(rgba(100,100,100,0.12) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(100,100,100,0.12) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px",
          zIndex: 0,
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 70% at 70% 50%, transparent 20%, hsl(var(--background)) 100%)",
          zIndex: 1,
        }}
      />

      {/* ── Linke Spalte ── */}
      <div
        className="hidden md:flex flex-col justify-center"
        style={{
          position: "relative",
          zIndex: 2,
          flex: "0 0 45%",
          paddingLeft: "clamp(2rem, 6vw, 5rem)",
          paddingRight: "2rem",
        }}
      >
        {/* Wortmarke */}
        <div style={{ marginBottom: "1.75rem" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "hsl(var(--foreground))",
              display: "block",
            }}
          >
            PPM - Play Pal Manager Für Verein
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "hsl(var(--muted-foreground))",
              display: "block",
              marginTop: "0.4rem",
            }}
          >
            Shift Management System
          </span>
        </div>

        {/* Trennlinie */}
        <div
          style={{
            width: "2rem",
            height: "1px",
            backgroundColor: "hsl(var(--border))",
            marginBottom: "1.5rem",
          }}
        />

        {/* Kurzbeschreibung */}
        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.75,
            color: "hsl(var(--muted-foreground))",
            maxWidth: "340px",
            marginBottom: "2rem",
          }}
        >
          Zentrales System zur Verwaltung von Einsätzen, Teams und Rollen —
          für Koordinatoren, Leader und Mitarbeiter in einer Anwendung.
        </p>

        {/* Feature-Karten */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            maxWidth: "380px",
          }}
        >
          {features.map(({ icon, title, sub }) => (
            <div
              key={title}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "10px",
                padding: "0.85rem 1rem",
                display: "flex",
                flexDirection: "column" as const,
                gap: "0.5rem",
              }}
            >
              {/* Icon-Badge */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  backgroundColor: "hsl(var(--secondary))",
                  border: "0.5px solid hsl(var(--border))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  color: "hsl(var(--foreground))",
                  fontWeight: 500,
                }}
              >
                {icon}
              </div>
              {/* Texte */}
              <div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "hsl(var(--foreground))",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "hsl(var(--muted-foreground))",
                    marginTop: "2px",
                    lineHeight: 1.4,
                  }}
                >
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rechte Spalte — Login-Card ── */}
      <div
        className="flex flex-1 items-center justify-center"
        style={{ position: "relative", zIndex: 2 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
            <CardDescription>
              Zugangsdaten eingeben, um fortzufahren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Anmelden..." : "Anmelden"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:underline"
              >
                Registrieren
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}