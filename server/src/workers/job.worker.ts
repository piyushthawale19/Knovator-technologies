import { Worker } from 'bullmq'
import { redis } from '../config/redis'
import config from '../config/env'
import { QueuedJobPayload } from '../types/job.types'
import { upsertJob } from '../services/job.service'
import { incrementLogStats } from '../services/import-log.service'

/**
 * Start a BullMQ worker that processes jobs from the queue,
 * upserts them into MongoDB, and reports results back to the
 * import log using atomic $inc updates.
 */
export function startWorker(): Worker {
    const worker = new Worker<QueuedJobPayload>(
        'job-import',
        async (job) => {
            const { importLogId, ...jobData } = job.data

            try {
                const result = await upsertJob(jobData)

                // Atomically update the correct counter on the import log
                await incrementLogStats(
                    importLogId,
                    result.isNew ? 'newJobs' : 'updatedJobs',
                )

                return { isNew: result.isNew }
            } catch (err) {
                const reason = err instanceof Error ? err.message : 'Unknown error'

                // Record the failure on the import log
                await incrementLogStats(importLogId, 'failedJobs', {
                    jobId: jobData.guid,
                    reason,
                })

                throw err // Re-throw so BullMQ marks the job as failed
            }
        },
        {
            connection: redis,
            concurrency: config.queue.concurrency,
        },
    )

    worker.on('completed', (job, result) => {
        const tag = (result as { isNew: boolean }).isNew ? 'NEW' : 'UPD'
        console.log(`  [${tag}] ${job.data.title}`)
    })

    worker.on('failed', (job, err) => {
        console.error(`  [FAIL] ${job?.data?.title ?? job?.id} — ${err.message}`)
    })

    console.log(`🔧 Worker started (concurrency=${config.queue.concurrency})`)
    return worker
}
