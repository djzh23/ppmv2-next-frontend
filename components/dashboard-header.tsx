"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout, getAuthUser } from "@/lib/auth"
import { roleColorSchemes, defaultColorScheme } from "@/lib/role-colors"
import { LogOut } from "lucide-react"

const coordinatorNavLinks = [
  { href: "/coordinator/shifts", label: "Einsätze" },
  { href: "/coordinator/locations", label: "Unterkünfte" },
  { href: "/coordinator/team", label: "Team" },
]

interface DashboardHeaderProps {
  section: string
  isLoading?: boolean
}

export function DashboardHeader({ section, isLoading }: DashboardHeaderProps) {
  const user = getAuthUser()
  const role = user?.role as string | undefined
  const colors = (role && roleColorSchemes[role]) ? roleColorSchemes[role] : defaultColorScheme
  const pathname = usePathname()
  const isCoordinator = role === "Coordinator"

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        overflow: "hidden",
        boxShadow: `0 2px 16px ${colors.shadow}`,
      }}
    >
      {/* Gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: colors.headerGradient,
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
          top: "-30px",
          left: "10%",
          width: "200px",
          height: "100px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />

      <div
        className="container mx-auto px-6"
        style={{ position: "relative", zIndex: 3 }}
      >
        {/* Main row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "#ffffff",
                textShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            >
              Einsätze
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", lineHeight: 1 }}>/</span>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.01em",
              }}
            >
              {section}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {user?.email && (
              <Link
                href="/profile"
                className="hidden sm:block"
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.75)",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.25)",
                  paddingBottom: "1px",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,1)"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"
                }}
              >
                {user.email}
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              disabled={isLoading}
              className="hover:bg-white/20 hover:text-white"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.85)",
                padding: "0 10px",
                height: "32px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
              }}
            >
              <LogOut style={{ width: "13px", height: "13px" }} />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Coordinator sub-nav */}
        {isCoordinator && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", paddingBottom: "0.5rem" }}>
            {coordinatorNavLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
                    textDecoration: "none",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "999px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                    border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
