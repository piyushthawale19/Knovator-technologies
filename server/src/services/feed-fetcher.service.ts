import axios from 'axios'
import { parseJobFeed } from '../utils/xml-parser'
import { enqueueJobs } from './queue.service'
import { createImportLog } from './import-log.service'
import { QueuedJobPayload } from '../types/job.types'


export async function fetchAndEnqueueFeed(feedUrl: string): Promise<void> {
    const start = Date.now()
    try {
        console.log(`📥 Fetching: ${feedUrl}`)
        const { data: xml } = await axios.get<string>(feedUrl, { timeout: 30_000 })

        const jobs = await parseJobFeed(xml, feedUrl)
        console.log(`  Parsed ${jobs.length} jobs`)

        // Create the import log entry *before* queueing.
        // The worker will atomically $inc the counters as it processes each job.
        const log = await createImportLog({
            fileName: feedUrl,
            totalFetched: jobs.length,
            totalImported: 0,
            newJobs: 0,
            updatedJobs: 0,
            failedJobs: 0,
            failures: [],
            duration: Date.now() - start,
        })

        if (jobs.length > 0) {
            // Attach the importLogId to every job payload
            const payloads: QueuedJobPayload[] = jobs.map((job) => ({
                ...job,
                importLogId: log._id.toString(),
            }))
            await enqueueJobs(payloads)
        }

        console.log(`✅ Feed queued: ${feedUrl} (logId=${log._id})`)
    } catch (err) {
        const reason = err instanceof Error ? err.message : 'Unknown error'
        console.error(`❌ Feed failed: ${feedUrl} — ${reason}`)

        await createImportLog({
            fileName: feedUrl,
            totalFetched: 0,
            totalImported: 0,
            newJobs: 0,
            updatedJobs: 0,
            failedJobs: 1,
            failures: [{ jobId: feedUrl, reason }],
            duration: Date.now() - start,
        })
    }
}

/**
 * Fetch all configured feeds sequentially.
 */
export async function fetchAllFeeds(urls: string[]): Promise<void> {
    for (const url of urls) {
        await fetchAndEnqueueFeed(url)
    }
}
