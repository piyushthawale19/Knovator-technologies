import { Router } from 'express'
import importLogRoutes from './import-log.routes'
import importRoutes from './job.routes'
import statsRoutes from './stats.routes'

const router = Router()

router.get('/health', (_req, res) => {
    res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() })
})

router.use('/import-logs', importLogRoutes)
router.use('/import', importRoutes)
router.use('/jobs', statsRoutes)

export default router
