# AIRMAN Core (Level 1)

Production-minded Level 1 implementation with:
- Auth + RBAC
- Learning (course/module/lesson + quiz attempts/scoring)
- Scheduling (availability + booking workflow with conflict detection)
- Docker Compose full stack
- CI for lint/test/build

## Stack
- Backend: Node.js, Express, Prisma, PostgreSQL, Redis
- Frontend: React (JSX), React Router, Axios
- DevOps: Docker Compose, GitHub Actions

## CI Status
- Workflow: `.github/workflows/ci.yml`
- Badge (replace `<owner>` and `<repo>`): `https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg`
- Runs page (replace `<owner>` and `<repo>`): `https://github.com/<owner>/<repo>/actions/workflows/ci.yml`

## One-command local run

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Backend setup (without Docker)

```bash
cd backend
npm ci
npm run migrate
npm run generate
npm run seed
npm run dev
```

## Frontend setup (without Docker)

```bash
cd frontend
npm ci
npm start
```

## API highlights
- `POST /api/v1/auth/register|login|refresh|logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/users/instructors` (admin)
- `PATCH /api/v1/users/:id/approve` (admin)
- `GET /api/v1/users` (admin)
- `POST /api/v1/courses` (instructor/admin)
- `GET /api/v1/courses` (search + pagination)
- `POST /api/v1/courses/:id/modules`
- `POST /api/v1/modules/:id/lessons`
- `POST /api/v1/quizzes/:lessonId/questions` (instructor/admin quiz authoring)
- `POST /api/v1/quizzes/:lessonId/attempt`
- `GET /api/v1/quizzes/my-attempts`
- `POST /api/v1/bookings/availability` (instructor)
- `POST /api/v1/bookings` (student)
- `GET /api/v1/bookings?from=<ISO>&to=<ISO>` (weekly calendar list filtering)
- `PATCH /api/v1/bookings/:id/approve` (admin)
- `PATCH /api/v1/bookings/:id/complete`
- `PATCH /api/v1/bookings/:id/cancel`

## RBAC matrix
- Admin: create instructors, approve students, approve bookings
- Instructor: create content, manage availability, complete bookings
- Student: view content, attempt quizzes, request bookings

## Tests

Backend:
```bash
cd backend
npm run test:unit
npm run test:integration
npm run test:coverage
```

Frontend:
```bash
cd frontend
npm test -- --watchAll=false
```

Admin Login
admin@airman.local
admin123

## CI
GitHub Actions workflow: `.github/workflows/ci.yml`

Runs:
- Backend lint + unit + integration + coverage gate
- Frontend lint + test + build

## Demo checklist
- Key flows: login, course browse/search, quiz attempt, booking request/approval
- RBAC proof: role-restricted API and routes
- Weekly schedule view proof: bookings page week navigator + per-day list
- Tests running: backend + frontend commands above
- CI passing: workflow status in GitHub Actions
- Optional: add cloud deployment URL if available
