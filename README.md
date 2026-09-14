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

## Shift Workflow

The frontend reflects a multi-role shift planning flow:

1. **Coordinator** creates a shift (title, time, location) and assigns a Festmitarbeiter as Leader. The shift is saved as `Draft`. The Coordinator can also assign themselves as Leader.
2. **Leader** sees the Draft shift in their Leader Inbox, adds team members from available staff, and proposes the team when ready.
3. **Team members** receive the shift invitation (`PendingApproval`) and can accept or decline.
4. Once **all members accept**, the shift auto-transitions to `Planned`.
5. **Coordinator** sees the assembled team and starts the shift (`Active`), then eventually completes it.

### What Is Pending / To Be Improved

- **Remove participant:** Leader can add members but not yet remove them
- **Decline with reason:** members should be able to provide a reason when declining, visible to the Leader and Coordinator
- **Handling declined members:** when someone declines, the Leader needs to be notified and able to replace them before the shift can reach Planned
- **Notifications:** in-app alerts for shift assignment, proposals, acceptances, and declines
- **Coordinator shift detail:** clearer per-status action buttons (Start, Complete, Cancel) with confirmation dialogs
- **Coordinator-as-Leader flow:** edge case validation when the Coordinator assigns themselves as Leader

## Features

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
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Start dev server
npm run dev
```

`.env.local` requires one variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5105
```

The app connects to the live API by default if the variable is not set. Demo accounts (password: `Pass123$`):

| Email | Role |
|---|---|
| `admin@test.com` | Admin |
| `koord1@test.com` | Coordinator |
| `fest1@test.com` | Festmitarbeiter |
| `hon1@test.com` | Honorarkraft |

## Roadmap

- Replace JWT localStorage auth with BFF pattern and HttpOnly cookies
- Availability-based dropdowns for location and leader selection
- Conflict handling (409) for overlapping shift assignments
- .NET MAUI Blazor Hybrid client as the primary production frontend
