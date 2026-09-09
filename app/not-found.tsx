import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
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

      <div style={{ position: "relative", textAlign: "center", maxWidth: "380px" }}>
        <div
          style={{
            fontSize: "4rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "hsl(var(--foreground))",
            lineHeight: 1,
            marginBottom: "0.5rem",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "hsl(var(--foreground))",
            marginBottom: "0.5rem",
          }}
        >
          Seite nicht gefunden
        </h1>

        <p
          style={{
            fontSize: "0.85rem",
            color: "hsl(var(--muted-foreground))",
            lineHeight: 1.6,
            marginBottom: "1.75rem",
          }}
        >
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>

        <Button asChild>
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </div>
  )
}
