import { Request, Response } from 'express'
import { fetchAndEnqueueFeed } from '../services/feed-fetcher.service'
import config from '../config/env'


export async function handleTriggerImport(
    _req: Request,
    res: Response,
): Promise<void> {
    try {
        for (const url of config.jobFeedUrls) {
            await fetchAndEnqueueFeed(url)
        }
        res.json({ success: true, message: 'Import triggered' })
    } catch (err) {
        console.error('POST /import/trigger error:', err)
        res.status(500).json({ success: false, error: 'Import trigger failed' })
    }
}
