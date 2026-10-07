# Code Arena

Code Arena is a browser-based coding judge. Users can browse programming problems, write and run code, submit solutions, and review their submissions. Administrators can manage problems and test cases and view platform activity.

## Features

- Problem browsing and difficulty filtering
- In-browser code editor with C, C++, Java, and Python support
- Custom-input runs using each problem's configured time and memory limits
- Asynchronous submission judging against saved test cases
- Submission history with verdicts and submitted source code
- User profiles and an admin area for managing problems, test cases, users, and submissions
- Docker-based execution configured with network isolation and per-problem resource limits

## Technology

- **Frontend:** React, Vite, React Router, Tailwind CSS, Monaco Editor
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Job queue:** Redis and BullMQ
- **Code execution:** Docker

## Requirements

Install or run the following before starting the application:

- Node.js and npm
- PostgreSQL
- Redis
- Docker with its Linux container engine running

The judge uses Docker images configured in `backend/src/docker/languages.js`. Docker downloads an image the first time it is needed.

## Local setup

### 1. Configure PostgreSQL

Create a database named `online_judge`, then apply the schema from the repository root:

```powershell
createdb -U postgres online_judge
psql -U postgres -d online_judge -f backend/database/schema.sql
```

Alternatively, create the database and run `backend/database/schema.sql` using pgAdmin. The schema creates the application's tables and adds missing problem metadata columns without deleting existing rows.

### 2. Configure the backend

Create `backend/.env` with your PostgreSQL credentials and a long, private JWT secret:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=online_judge
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=replace_with_a_long_random_secret
```

Redis uses the local default connection (`localhost:6379`) unless its connection is configured in the Redis client code.

Install backend dependencies:

```powershell
cd backend
npm install
```

### 3. Configure the frontend

Create `frontend/.env` and point it at the backend API:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Install frontend dependencies:

```powershell
cd frontend
npm install
```

### 4. Start the services

Start PostgreSQL, Redis, and Docker first. Then run the API, judge worker, and frontend in separate terminals:

**Backend API**

```powershell
cd backend
npm run dev
```

**Judge worker**

```powershell
cd backend
node src/workers/judgeWorker.js
```

**Frontend**

```powershell
cd frontend
npm run dev
```

Open the local URL printed by Vite in your browser. The backend listens on port `5000` by default and exposes a health check at `http://localhost:5000/health`.

## First admin account

1. Register an account in the application.
2. In PostgreSQL, promote that account to admin by replacing the email below with the registered email:

   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

3. Sign out and sign in again so the application receives a token with the updated role.
4. Use the Admin area to create and publish problems and add their test cases.

## Using the judge

- Create a problem with its statement, input/output format, constraints, time limit in milliseconds, and memory limit in megabytes.
- Add test cases as raw standard input and expected standard output. Publishing requires at least one test case, including a hidden test case.
- Use **Run** to execute code with custom input. Input must match the problem's input format.
- Use **Submit** to enqueue a submission for judging against the problem's saved test cases. The backend API and judge worker must both be running.
- Open a row in **My Submissions** to view the code saved with that submission.

## API overview

The API is mounted under `/api`:

| Endpoint | Purpose |
|---|---|
| `/api/auth/register`, `/api/auth/login` | Register and sign in |
| `/api/auth/me` | Get the current authenticated user |
| `/api/problems` | List and manage problems |
| `/api/problems/:id/testcases` | Manage a problem's test cases (admin) |
| `/api/execute` | Run code with custom input (authenticated) |
| `/api/submissions` | Create submissions; list all submissions (admin) |
| `/api/submissions/mine` | List the current user's submissions |
| `/api/submissions/:id` | View a submission (owner or admin) |
| `/api/users` | List users (admin) |
| `/api/stats` | Get dashboard statistics (admin) |

Problem listing and detail retrieval are public. Administrative write operations require an authenticated admin account.

## Available scripts

Run these from the corresponding package directory:

| Directory | Command | Purpose |
|---|---|---|
| `backend` | `npm run dev` | Start the API with Nodemon |
| `backend` | `npm start` | Start the API |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run lint` | Run Oxlint |
| `frontend` | `npm run preview` | Preview a production frontend build |
