"use client"

import { getAuthUser } from "@/lib/auth"
import { roleColorSchemes, defaultColorScheme } from "@/lib/role-colors"

export function DashboardFooter() {
  const year = new Date().getFullYear()
  const user = getAuthUser()
  const role = user?.role as string | undefined
  const colors = (role && roleColorSchemes[role]) ? roleColorSchemes[role] : defaultColorScheme

  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: "auto",
        boxShadow: `0 -2px 16px ${colors.shadow}`,
      }}
    >
      {/* Gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: colors.footerGradient,
          zIndex: 0,
        }}
      />
      {/* Dot pattern */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          zIndex: 1,
        }}
      />
      {/* Radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-30px",
          right: "10%",
          width: "200px",
          height: "100px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />

      <div
        className="container mx-auto px-6"
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "44px",
          paddingTop: "0.6rem",
          paddingBottom: "0.6rem",
          flexWrap: "wrap",
          gap: "0.4rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              textShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          >
            PPM
          </span>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }}>
            Play Pal Manager Für Verein
          </span>
        </div>

        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.85)" }}>
          © {year} Shift Management System
        </span>
      </div>
    </footer>
  )
}
