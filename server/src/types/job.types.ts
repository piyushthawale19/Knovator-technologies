export interface NormalizedJob {
    guid: string
    title: string
    company: string
    location: string
    description: string
    url: string
    publishedDate: Date
    source: string
}

/** Data shape that goes into the BullMQ queue — job payload + log reference */
export interface QueuedJobPayload extends NormalizedJob {
    importLogId: string
}

export interface ImportStats {
    totalFetched: number
    totalImported: number
    newJobs: number
    updatedJobs: number
    failedJobs: number
    failures: Array<{ jobId: string; reason: string }>
}
