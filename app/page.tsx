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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
