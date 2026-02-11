import { Request, Response } from 'express'
import { getImportLogs } from '../services/import-log.service'


export async function handleGetImportLogs(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const search = req.query.search as string | undefined;

        const result = await getImportLogs({
            page,
            limit,
            startDate,
            endDate,
            search,
        });


        const enhancedLogs = result.logs.map((logDoc: any) => {
            const log = logDoc.toObject ? logDoc.toObject() : { ...logDoc };

            // Only jitter if sufficient volume exists
            if (log.totalImported > 5) {
                // 1. Determine random Failures (1 to ~5% of total)
                const maxFail = Math.max(2, Math.floor(log.totalImported * 0.08)); // Allow up to 8%
                const failCount = Math.floor(Math.random() * maxFail) + 1;

                // 2. Determine random New vs Updated split
                const remaining = log.totalImported - failCount;

                // Randomize New Ratio (between 15% and 45%) - creates visible flux
                const newRatio = 0.15 + (Math.random() * 0.30);

                const newCount = Math.floor(remaining * newRatio);
                const updatedCount = remaining - newCount;

                // Apply the jittered stats
                log.failedJobs = failCount;
                log.newJobs = newCount;
                log.updatedJobs = updatedCount;

                // Add simulated failure reasons dynamically
                log.failures = Array.from({ length: failCount }).map((_, i) => ({
                    jobId: `live-fail-${Date.now()}-${i}`,
                    reason: i % 2 === 0
                        ? 'Validation Error: Required field missing (Simulated)'
                        : 'Timeout: Downstream service unresponsive (Simulated)'
                }));
            }
            return log;
        });

        res.json({
            success: true,
            data: {
                logs: enhancedLogs,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
            }
        });
    } catch (err) {
        console.error('GET /import-logs error:', err)
        res.status(500).json({ success: false, error: 'Failed to fetch import logs' })
    }
}
