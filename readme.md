# Smart Hostel Complaint Management System

A full-stack web application that lets hostel students report maintenance and facility issues online instead of relying on calls, WhatsApp, or in-person visits. Admins (wardens) triage and assign complaints to workers, who resolve and mark them complete — with full status tracking throughout.

## Features

**Student**
- Register and log in
- Submit complaints with category, title, description, and optional photo
- View complaint history and track status in real time
- Edit profile (name, phone, room number)

**Admin**
- View all complaints with filters by status and category
- Assign complaints to workers
- Manually update complaint status
- View stats dashboard (totals by status and category)

**Worker**
- View complaints assigned to them
- Mark complaints as completed

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios

**Backend**
- Node.js + Express
- Prisma ORM (v6) + MySQL
- JWT-based authentication
- Multer for photo uploads

## Complaint Status Flow

```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
```

## Project Structure

```
hostel-complaint-system/
├── backend/
│   ├── prisma/              # Schema and migrations
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── routes/          # API route definitions
│       ├── middleware/      # Auth, role guards, upload handling
│       └── uploads/         # Uploaded complaint photos
└── frontend/
    └── src/
        ├── pages/           # Login, Register, dashboards, Profile
        ├── components/      # Reusable UI (e.g. StatsView)
        ├── context/         # AuthContext (JWT/user session)
        ├── routes/          # ProtectedRoute wrapper
        └── api/             # Axios instance with JWT interceptor
```

## Data Model

Single unified `User` table with a `role` enum (`STUDENT`, `ADMIN`, `WORKER`) — one login flow, one JWT scheme, role-based access via middleware and frontend routing.

```
User
 ├─ id, name, email, password, role, roomNo, phone, createdAt
 ├─ complaints (as student)
 ├─ assignedComplaints (as worker)
 └─ statusChanges

Complaint
 ├─ id, category, title, description, photoUrl, status
 ├─ student (User)
 ├─ worker (User, optional)
 └─ logs (ComplaintStatusLog[])

ComplaintStatusLog
 └─ tracks every status change with who made it and when
```

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register as a student |
| POST | `/api/auth/login` | Public | Log in, receive JWT |
| POST | `/api/complaints` | Student | Submit a complaint (with optional photo) |
| GET | `/api/complaints/mine` | Student | View own complaints |
| GET | `/api/complaints/assigned` | Worker | View assigned complaints |
| GET | `/api/complaints` | Admin | View all complaints (filterable by status/category) |
| GET | `/api/complaints/:id` | Any (own complaint for students) | Full complaint detail + status log |
| PATCH | `/api/complaints/:id/assign` | Admin | Assign a worker |
| PATCH | `/api/complaints/:id/status` | Admin | Update complaint status |
| PATCH | `/api/complaints/:id/complete` | Worker | Mark assigned complaint complete |
| GET | `/api/stats` | Admin | Complaint totals by status and category |
| GET | `/api/users?role=WORKER` | Admin | List workers (for assignment) |
| GET | `/api/users/me` | Authenticated | Get own profile |
| PATCH | `/api/users/me` | Authenticated | Update own profile |

All protected routes require `Authorization: Bearer <token>`.

## Quick Start (Docker)

The fastest way to run this project — no local Node.js or MySQL installation required.

**Prerequisites:** Docker and Docker Compose installed.

```bash
git clone https://github.com/Hetavpatell/hostel-complaint-system.git
cd hostel-complaint-system
docker compose up --build
```

That's it. This spins up MySQL, runs database migrations automatically, and starts both the backend and frontend.

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

First run takes a few minutes while images build and MySQL initializes. Subsequent runs are much faster with `docker compose up`.

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
DATABASE_URL="mysql://user:password@localhost:3306/hostel_complaints"
JWT_SECRET="your-secret-here"
PORT=5000
```

Run migrations and start the server:
```bash
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend running at `http://localhost:5000`.

## Notes

- Public self-registration is restricted to the `STUDENT` role by design. Admin and worker accounts are intended to be provisioned separately, not created through public signup.
- Photos are stored on local disk under `backend/src/uploads` and served statically; the DB stores only the relative path.
- Status updates use client-side polling/refresh rather than WebSockets, which is sufficient for this use case.

## License

This project was built as a learning/portfolio project. No license specified.
