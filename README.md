# Rolemark: Job Application Tracker

Rolemark keeps your job search organized in one place. Track companies and roles, update application stages, search your list, and save links and notes for each opportunity.

## Requirements

- Node.js 18 or newer, with npm
- MongoDB running locally, or a MongoDB Atlas connection string

Rolemark has no accounts and is intended for a single local user. Do not expose the API to untrusted networks.

## Run locally

1. Copy `.env.example` to `.env` in the project root, or keep your existing `.env` and set `MONGODB_URI` to your MongoDB connection string.
2. Install packages and start both the API and interface from the project root:

```bash
npm run install:all
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`. If that port is occupied, Vite selects another available port. The API listens on port `5000` by default. MongoDB uses the `job_application_tracker` database; override it with `MONGODB_DB` if desired.

## Use

- Add an application with a company, role, status, and application date.
- Use search and status filters to find applications; change status inline as your search progresses.
- Add optional location, job listing URL, and notes when creating or editing an application.
- The API supplies `Applied` as the default status and `Date.now` as the default application date.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Check API and database connection state |
| GET | `/api/jobs` | List applications, newest application date first |
| POST | `/api/jobs` | Create an application |
| PUT | `/api/jobs/:id` | Update an application |
| DELETE | `/api/jobs/:id` | Delete an application |

The `Job` Mongoose model requires `companyName` and `role`. Supported statuses are `Applied`, `Interviewing`, `Offer`, `Rejected`, and `Withdrawn`.

## Project layout

- `client/` - React dashboard and Vite setup
- `server/` - Express API, Mongoose model, CRUD routes, and schema tests
- `.env.example` - MongoDB connection and API port template