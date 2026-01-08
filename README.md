# Team Task Manager (MERN + TypeScript)

A production-ready, monorepo Team Task Manager with a TypeScript Express/MongoDB backend and a React TypeScript frontend. It includes JWT auth, team-based access controls, task workflows, and clear API conventions.

## Features
- JWT authentication with logout invalidation
- Team-based access control for tasks and teams
- Task filters, pagination, and sorting
- Admin dashboard for user role management and team membership
- Clean error handling and consistent API responses
- TypeScript strict mode across backend and frontend
- Jest + Supertest tests with in-memory MongoDB

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose, TypeScript, Joi, JWT, bcrypt
- Frontend: React 18, React Router, TypeScript, Axios, Vite
- Tooling: ESLint, Prettier, Jest, Supertest

## Prerequisites
- Node.js 18+
- MongoDB instance (local or hosted)

## Setup
1) Clone the repo
2) Configure environment files
- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`
3) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```
4) Run locally
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

## Admin/Lead Setup
The PDF does not require role selection at signup. By default, signup creates a `member` user. To create an admin, run the seed script:
```bash
cd backend
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=ChangeMe123! npm run seed:admin
```
Then log in as that admin and use `PUT /api/users/:id/role` to promote a user to `lead` or `admin`.

## Environment Variables
Backend (`backend/.env`):
- `PORT` - API port (default 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing tokens
- `JWT_EXPIRES_IN` - token expiration (default 7d)
- `CORS_ORIGIN` - comma-separated frontend origins (default http://localhost:5173)

Frontend (`frontend/.env`):
- `VITE_API_BASE_URL` - API base URL (default http://localhost:5000)

Admin features:
- Admin dashboard at `/admin`
- Admin can list users, update roles, and add users to teams
- Admin can view all tasks across teams

## API Endpoints
Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Tasks (protected)
- `GET /api/tasks` (filters: `status`, `priority`, `teamId`, `assignedTo`, `dueBefore`, `dueAfter`, `createdBy`, `page`, `limit`, `sortBy`, `sortOrder`)
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/search?q=`
- `GET /api/stats`

Teams (protected)
- `GET /api/teams`
- `GET /api/teams/:id`
- `POST /api/teams` (supports `memberIds` to add members on create)
- `PUT /api/teams/:id`
- `POST /api/teams/:id/members`

Users (protected)
- `GET /api/users/search?email=` (used by team member add flow)
- `GET /api/users?search=&role=&limit=` (list users for member selection)
- `POST /api/users` (admin create user: name, email, password, role)
- `PUT /api/users/:id/role` (admin only)
- `PUT /api/users/me/password` (change current user password)
- `GET /api/docs` (Swagger UI)

## Models
User
- `name`, `email`, `password` (hashed), `role`, `tokenVersion`, timestamps

Team
- `name`, `description`, `members`, `createdBy`, timestamps

Task
- `title`, `description`, `status`, `priority`, `assignedTo`, `teamId`, `dueDate`, `createdBy`, timestamps

## Architecture Decisions
- **Logout invalidation**: `tokenVersion` on `User` is incremented on logout. This is simple and avoids maintaining a blacklist collection.
- **Validation**: Joi schemas shared across routes to keep rules centralized and consistent.
- **Access control**: Teams gate access for all tasks and team endpoints to prevent cross-team data leakage.

## Known Issues / Tradeoffs
- Token invalidation via `tokenVersion` requires a DB read on each request.
- No refresh tokens or session rotation yet.
- Simple role model (member/lead/admin) with minimal admin-only actions.

## Future Improvements
- Add refresh tokens + rotation
- Expand team roles and permissions
- Add task activity logs and notifications
- Add `/api/stats` aggregation endpoint
- Add richer frontend validation and optimistic updates
- add email notifications
- add real time status change
- add reminder
- add drag and drop between status for user same like trello for better visibility and easy to use


## Testing
Backend tests (Jest + Supertest + mongodb-memory-server):
```bash
cd backend
npm test
```

## Commit Guidance
- Use small, focused commits
- Suggested format: `feat:`, `fix:`, `chore:`, `docs:`

## Repo Structure
```
/
  backend/
  frontend/
  README.md
  LEADERSHIP.md
```
