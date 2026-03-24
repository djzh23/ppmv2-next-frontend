export type RoleColorScheme = {
  headerGradient: string
  footerGradient: string
  shadow: string
}

export const roleColorSchemes: Record<string, RoleColorScheme> = {
  Admin: {
    headerGradient: "linear-gradient(160deg, #f97316 0%, #dc2626 50%, #991b1b 100%)",
    footerGradient: "linear-gradient(160deg, #991b1b 0%, #dc2626 50%, #f97316 100%)",
    shadow: "rgba(220,38,38,0.3)",
  },
  Coordinator: {
    headerGradient: "linear-gradient(160deg, #38bdf8 0%, #2563eb 45%, #6d28d9 100%)",
    footerGradient: "linear-gradient(160deg, #6d28d9 0%, #2563eb 55%, #38bdf8 100%)",
    shadow: "rgba(37,99,235,0.25)",
  },
  Festmitarbeiter: {
    headerGradient: "linear-gradient(160deg, #6ee7b7 0%, #059669 45%, #0f766e 100%)",
    footerGradient: "linear-gradient(160deg, #0f766e 0%, #059669 55%, #6ee7b7 100%)",
    shadow: "rgba(5,150,105,0.25)",
  },
  Honorarkraft: {
    headerGradient: "linear-gradient(160deg, #c4b5fd 0%, #7c3aed 45%, #be185d 100%)",
    footerGradient: "linear-gradient(160deg, #be185d 0%, #7c3aed 55%, #c4b5fd 100%)",
    shadow: "rgba(124,58,237,0.25)",
  },
  Leader: {
    headerGradient: "linear-gradient(160deg, #fcd34d 0%, #f59e0b 45%, #b45309 100%)",
    footerGradient: "linear-gradient(160deg, #b45309 0%, #f59e0b 55%, #fcd34d 100%)",
    shadow: "rgba(245,158,11,0.25)",
  },
}

export const defaultColorScheme: RoleColorScheme = roleColorSchemes.Coordinator
