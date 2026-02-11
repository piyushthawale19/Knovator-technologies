# Architecture Overview

This document outlines the system architecture, data flow, and some of the key design decisions we made to ensure the system is robust and scalable.

## How it Works

The system is designed to handle XML feed ingestion asynchronously. Instead of processing everything in a single long-running request, we break it down into fetching and processing stages.

```mermaid
graph TD
    A[Monitor/Cron] -->|Trigger| B[Feed Fetcher]
    B -->|Log Start| C[(MongoDB: ImportLogs)]
    B -->|Queue Jobs| D[BullMQ (Redis)]
    D -->|Pick Job| E[Worker]
    E -->|Save| F[(MongoDB: Jobs)]
    E -->|Update Stats| C
```

### The Process

1.  **Trigger**: The process kicks off via a Cron job or a manual trigger from the UI.
2.  **Fetch & Parse**: The `Feed Fetcher` pulls the XML from the source and converts it into JSON objects.
3.  **Logging**: Before processing, we create an entry in the `ImportLogs` collection. This acts as our "master record" for the current batch.
4.  **Queueing**: This is a key part of the design—we push the parsed items into a **BullMQ** queue. This creates a buffer so the fetcher finishes quickly, even if the database write operations take longer.
5.  **Processing**: Background workers pick up jobs from the queue. We're currently defaulting to a concurrency of 5, which strikes a good balance between speed and database load.
6.  **Live Updates**: As workers save jobs to the `Jobs` collection, they atomically update the `ImportLog`. This ensures the UI properly reflects the progress in real-time without race conditions.

---

## Database Schema

We are using MongoDB for its flexibility with unstructured data, which is helpful given the variability in XML feeds.

### `jobs` Collectiongit
This stores the normalized job data. We use the `guid` as a unique identifier to handle upserts (insert if new, update if exists).

```typescript
{
  guid:          String,  // Unique index to prevent duplicates
  title:         String,
  company:       String,
  location:      String,
  description:   String,
  url:           String,
  publishedDate: Date,    // Indexed for sorting
  source:        String,
  createdAt:     Date,
  updatedAt:     Date
}
```

### `import_logs` Collection
Tracks the history of import runs.

```typescript
{
  timestamp:     Date,
  fileName:      String,  // Feed Source
  totalFetched:  Number,
  newJobs:       Number,  // Counters updated atomically
  updatedJobs:   Number,
  failedJobs:    Number,
  failures:      [{ jobId: String, reason: String }], // Error tracking
  duration:      Number
}
```

---

## Technical Decisions & Scalability

We made a few specific choices to ensure this scales well as we add more feeds.

**1. Decoupled Architecture (Redis + BullMQ)**
Parsing a feed is fast, but database writes are the bottleneck. By putting a queue in the middle, we decouple these two operations. It allows us to process 10 items or 10,000 items without timing out the initial HTTP request. It also gives us built-in retries for failed operations.

**2. Atomic Status Updates**
Since we have multiple workers running in parallel, updating a single status document is tricky. If two workers try to update the "count" at the same time, one update could be lost. We solved this by using MongoDB's atomic `$inc` operators, which are safe for concurrent updates.

**3. Bulk Operations**
Where possible, we use bulk operations (like adding jobs to the queue in batches) to minimize network overhead between the application and Redis.

---

## Deployment

Since we’re running a monorepo (both client and server in one repo), we deploy them as two separate services. Here is the configuration we use (e.g., for Render):

### Server
*   **Root Directory**: `server`
*   **Build Command**: `yarn && yarn build`
    *   *Note:* We must run `yarn build` to compile the TypeScript code into the `dist` folder.
*   **Start Command**: `yarn start`
*   **Environment Variables**: Ensure `MONGODB_URI`, `REDIS_URL`, etc., are set.

### Client
*   **Root Directory**: `client`
*   **Build Command**: `yarn && yarn build`
*   **Start Command**: `yarn start`
*   **Environment Variables**: `NEXT_PUBLIC_API_URL` should point to the live server URL.

---

## Stack

*   **Next.js**: Handles the dashboard. Key for us here was the ecosystem and how quickly we can build UI with Tailwind.
*   **Express**: A simple, lightweight backend to host the API and workers.
*   **MongoDB**: The schema-less nature works well here since we don't always know exactly what fields a feed might have.
*   **Redis**: required for BullMQ to handle the job queues effectively.
