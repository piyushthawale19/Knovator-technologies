import { ImportLog, IImportLog } from '../models/import-log.model'

/**
 * Create an import log record.
 */
export async function createImportLog(
    data: Partial<IImportLog>,
): Promise<IImportLog> {
    return ImportLog.create({ timestamp: new Date(), ...data })
}


export async function incrementLogStats(
    logId: string,
    field: 'newJobs' | 'updatedJobs' | 'failedJobs',
    failure?: { jobId: string; reason: string },
): Promise<void> {
    const update: Record<string, unknown> = {
        $inc: {
            totalImported: field !== 'failedJobs' ? 1 : 0,
            [field]: 1,
        },
    }

    // Push failure reason if applicable
    if (failure) {
        update.$push = { failures: failure }
    }

    await ImportLog.findByIdAndUpdate(logId, update)
}


export async function getImportLogs(opts: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    search?: string
}) {
    const page = Math.max(opts.page ?? 1, 1)
    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100)
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (opts.startDate || opts.endDate) {
        const range: Record<string, Date> = {}
        if (opts.startDate) range.$gte = new Date(opts.startDate)
        if (opts.endDate) range.$lte = new Date(opts.endDate)
        filter.timestamp = range
    }

    // Search by fileName (feed URL)
    if (opts.search) {
        filter.fileName = { $regex: opts.search, $options: 'i' }
    }

    const [logs, total] = await Promise.all([
        ImportLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ImportLog.countDocuments(filter),
    ])

    return { logs, total, page, totalPages: Math.ceil(total / limit) }
}
