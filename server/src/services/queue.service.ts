import { Queue } from 'bullmq'
import { redis } from '../config/redis'
import config from '../config/env'
import { QueuedJobPayload } from '../types/job.types'

export const jobQueue = new Queue('job-import', {
    connection: redis,
    defaultJobOptions: {
        attempts: config.queue.maxRetries,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
    },
})


export async function enqueueJobs(jobs: QueuedJobPayload[]): Promise<void> {
    const bulk = jobs.map((job, i) => ({
        name: 'process-job',
        data: job,
        opts: { jobId: `${Date.now()}-${i}` },
    }))
    await jobQueue.addBulk(bulk)
}
