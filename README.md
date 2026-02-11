# JobFeed Admin Portal

A full-stack scalable job importer system built with Next.js, Node.js Express, MongoDB, and Redis + BullMQ.

## Repository Structure

```
/client    → Next.js Admin UI
/server    → Node.js Express backend
/docs      → Architecture documentation
```

## Features

- Fetch XML job feeds (Jobicy, HigherEdJobs) and convert to JSON
- Push each job to a BullMQ queue backed by Redis
- Worker processes upsert jobs into MongoDB (no duplicates)
- Store import run logs into `import_logs` collection
- Admin UI shows **Import History Tracking** table

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### 1. Server Setup

```bash
cd server
npm install
cp .env.example .env   # edit values as needed
npm run dev
```

### 2. Client Setup

```bash
cd client
npm install
cp .env.example .env.local   # edit values as needed
npm run dev
```

### 3. Open the App

Visit **http://localhost:3000** to see the Admin Portal.

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/jobfeed` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | _(empty)_ |
| `QUEUE_CONCURRENCY` | Worker concurrency | `5` |
| `QUEUE_MAX_RETRIES` | Max retry attempts | `3` |
| `CRON_SCHEDULE` | Cron expression | `0 * * * *` (every hour) |
| `JOB_FEED_URLS` | Comma-separated feed URLs | Jobicy, HigherEdJobs |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Client (`client/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Documentation

- [Architecture](./docs/architecture.md)

## License

MIT
