# Shift Management System – Web Frontend

Ein modernes Next.js-Webfrontend zur Verwaltung von Einsätzen (Shifts) auf Basis einer .NET REST API. Das Frontend dient aktuell als Produkt- und Admin-UI und ist so aufgebaut, dass weitere Clients (z. B. .NET MAUI) später problemlos angebunden werden können.

## Funktionen

- 🛡️ Rollenbasierter Zugriff (RBAC): Admin, Koordinator, Festmitarbeiter (Leader)
- 🔄 Einsatz-Workflow: Draft → Planned → Active
- 👥 Benutzerverwaltung: Registrierung mit Admin-Freigabe
- 📅 Einsatzverwaltung: Einsätze erstellen, bearbeiten und veröffentlichen
- 📬 Leader-Inbox: Zuweisungen einsehen und annehmen
- 📱 Responsives UI: Basierend auf shadcn/ui und Tailwind CSS

## Technologie-Stack

- **Framework**: Next.js 16 (App Router)
- **Sprache**: TypeScript
- **UI**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Formulare**: React Hook Form + Zod
- **API-Anbindung**: zentraler Fetch-Client
- **Deployment**: Vercel

**Hinweis zur Authentifizierung**: Die Authentifizierung wird aktuell von JWT auf ein BFF-Modell mit HttpOnly-Cookies umgestellt.

## Architektur-Prinzipien

- 🧠 Keine Geschäftslogik im Frontend: Alle Regeln (Rollen, Verfügbarkeit, Konflikte) liegen im Backend.
- 🔌 Frontend-agnostische API: Die API ist für mehrere Clients nutzbar.
- 🔐 Vorbereitung für BFF: Auslegung für zukünftige Machine-to-Machine-Kommunikation.

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- Laufendes .NET Backend (Standard: http://localhost:5105)

### Schnellstart

Abhängigkeiten installieren:

```bash
npm install
```

Entwicklungsserver starten:

```bash
npm run dev
```

### Umgebungsvariablen (.env.local)

Erstellen Sie eine `.env.local`-Datei im Projektverzeichnis und konfigurieren Sie die Backend-URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5105
```

## Roadmap

- 🔐 BFF + HttpOnly-Cookie-Auth: Abschließende Umstellung der Authentifizierung.
- 📍 Verfügbarkeitsbasierte Dropdowns: Dynamische Anzeige von Locations & Leadern basierend auf der Verfügbarkeit.
- ⚠️ Finale Backend-Validierung: Implementierung von 409-Konflikten für bessere Benutzerführung.
- 🔗 Erweiterung um weitere Clients: Vorbereitung und Anbindung von Clients wie z. B. .NET MAUI.