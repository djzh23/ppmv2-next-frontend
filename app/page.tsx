"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserRole, isAuthenticated } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login")
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
        router.push("/forbidden")
    }
  }, [router])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "hsl(var(--background))",
      }}
    >
      {/* Grid-Hintergrund */}
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
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(var(--background)) 0%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Titel + Ladeindikator */}
      <div
        className="flex flex-col items-center gap-8 text-center"
        style={{ position: "relative", zIndex: 2 }}
      >
        {/* Wortmarke */}
        <div className="flex flex-col items-center gap-2 select-none">
          <span
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "hsl(var(--foreground))",
            }}
          >
            PPM
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Shift Management System
          </span>
        </div>

        {/* Trennlinie */}
        <div
          style={{
            width: "2.5rem",
            height: "1px",
            backgroundColor: "hsl(var(--border))",
          }}
        />

        {/* Ladeindikator */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="animate-spin rounded-full border-b-2"
            style={{
              width: "1.5rem",
              height: "1.5rem",
              borderColor: "hsl(var(--foreground))",
            }}
          />
          <p
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Weiterleitung...
          </p>
        </div>
      </div>
    </div>
  )
}