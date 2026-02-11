import { Request, Response } from 'express'
import { Job } from '../models/job.model'
import { ImportLog } from '../models/import-log.model'
import { redis } from '../config/redis'
import { jobQueue } from '../services/queue.service'


export async function handleDashboardStats(
    _req: Request,
    res: Response,
): Promise<void> {
    try {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const [
            totalJobs,
            jobsToday,
            uniqueSources,
            recentLogs,
            sourceBreakdown,
        ] = await Promise.all([
            Job.countDocuments(),
            Job.countDocuments({ createdAt: { $gte: todayStart } }),
            Job.distinct('source'),
            ImportLog.find()
                .sort({ timestamp: -1 })
                .limit(5)
                .lean(),
            Job.aggregate([
                {
                    $group: {
                        _id: '$source',
                        count: { $sum: 1 },
                        latestJob: { $max: '$publishedDate' },
                    },
                },
                { $sort: { count: -1 } },
            ]),
        ])

        const lastImport = recentLogs[0] ?? null

        res.json({
            success: true,
            data: {
                totalJobs,
                jobsToday,
                activeFeedCount: uniqueSources.length,
                lastImportAt: lastImport?.timestamp ?? null,
                lastImportDuration: lastImport?.duration ?? 0,
                recentImports: recentLogs,
                sourceBreakdown: sourceBreakdown.map((s) => ({
                    source: s._id,
                    count: s.count,
                    latestJob: s.latestJob,
                })),
            },
        })
    } catch (err) {
        console.error('GET /stats/dashboard error:', err)
        res.status(500).json({ success: false, error: 'Failed to get stats' })
    }
}


export async function handleQueueStatus(
    _req: Request,
    res: Response,
): Promise<void> {
    try {
        // Measure Redis latency
        const start = Date.now()
        await redis.ping()
        const latency = Date.now() - start

        // Get queue counts
        const [waiting, active, completed, failed] = await Promise.all([
            jobQueue.getWaitingCount(),
            jobQueue.getActiveCount(),
            jobQueue.getCompletedCount(),
            jobQueue.getFailedCount(),
        ])

        res.json({
            success: true,
            data: {
                redisLatency: latency,
                waiting,
                active,
                completed,
                failed,
            },
        })
    } catch (err) {
        console.error('GET /stats/queue error:', err)
        res.status(500).json({ success: false, error: 'Failed to get queue status' })
    }
}


export async function handleGetJobs(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1)
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
        const skip = (page - 1) * limit

        const search = (req.query.search as string) || ''
        const source = (req.query.source as string) || ''

        const filter: Record<string, unknown> = {}
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ]
        }
        if (source) {
            filter.source = source
        }

        const [jobs, total] = await Promise.all([
            Job.find(filter)
                .sort({ publishedDate: -1 })
                .skip(skip)
                .limit(limit)
                .select('-description')
                .lean(),
            Job.countDocuments(filter),
        ])

        res.json({
            success: true,
            data: {
                jobs,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (err) {
        console.error('GET /jobs error:', err)
        res.status(500).json({ success: false, error: 'Failed to fetch jobs' })
    }
}
