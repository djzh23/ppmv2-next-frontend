"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("[PPM] Unhandled error:", error)
  }, [error])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "hsl(var(--background))",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
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
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          textAlign: "center",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            backgroundColor: "hsl(var(--destructive) / 0.1)",
            border: "1px solid hsl(var(--destructive) / 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <AlertTriangle
            style={{ width: "24px", height: "24px", color: "hsl(var(--destructive))" }}
          />
        </div>

        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "hsl(var(--foreground))",
            marginBottom: "0.5rem",
          }}
        >
          Ein Fehler ist aufgetreten
        </h1>

        <p
          style={{
            fontSize: "0.85rem",
            color: "hsl(var(--muted-foreground))",
            marginBottom: "0.5rem",
            lineHeight: 1.6,
          }}
        >
          {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
        </p>

        {error.digest && (
          <p
            style={{
              fontSize: "0.72rem",
              color: "hsl(var(--muted-foreground))",
              marginBottom: "1.5rem",
              fontFamily: "monospace",
            }}
          >
            Fehler-ID: {error.digest}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
          <Button variant="outline" onClick={() => router.push("/")}>
            Zur Startseite
          </Button>
          <Button onClick={reset}>Erneut versuchen</Button>
        </div>
      </div>
    </div>
  )
}
