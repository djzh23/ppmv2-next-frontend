# PPM Next.js Client

This is the web frontend for **PPM V2**, a shift and team management system built on a .NET REST API.

The backend is designed to be client-agnostic — this Next.js app is one possible client, chosen for rapid prototyping and to demonstrate modern frontend development alongside the .NET backend. A future client is planned as a .NET MAUI Blazor Hybrid app.

## Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="public/screenshots/Home-Login-ppm.png" alt="Landing Page" width="100%" />
      <sub><b>Landing Page</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="public/screenshots/Admin-Dashboard-1-ppm.png" alt="Admin User Management" width="100%" />
      <sub><b>Admin: User Management</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="public/screenshots/Admin-Dashboard-2-ppm.png" alt="Admin Role Overview" width="100%" />
      <sub><b>Admin: Role Overview</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="public/screenshots/coordinator-shifts.png" alt="Coordinator Shifts" width="100%" />
      <sub><b>Coordinator: Shifts</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="public/screenshots/festmiatbeiter-shifts.png" alt="Staff Shift Inbox" width="100%" />
      <sub><b>Staff: Shift Inbox</b></sub>
    </td>
    <td align="center"></td>
  </tr>
</table>

## Features

- **Role-based access control** with four user roles: Admin, Coordinator, Festmitarbeiter, Honorarkraft
- **Shift workflow** from Draft to Planned, Active, Completed, or Cancelled
- **User management** with admin approval and role assignment
- **Coordinator dashboard** to create and publish shifts with leader assignment
- **Staff inbox** for assigned users to view and accept their shifts

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | shadcn/ui, Radix UI |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Auth | JWT (Bearer token) |
| Deployment | Vercel |

## Local Development

**Prerequisites:** Node.js 18+, running PPM V2 backend (default: `http://localhost:5105`)

```bash
npm install
npm run dev
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5105
```

## Roadmap

- Replace JWT localStorage auth with BFF pattern and HttpOnly cookies
- Availability-based dropdowns for location and leader selection
- Conflict handling (409) for overlapping shift assignments
- .NET MAUI Blazor Hybrid client as the primary production frontend
