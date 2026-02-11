import { Router } from 'express'
import { handleDashboardStats, handleGetJobs, handleQueueStatus } from '../controllers/stats.controller'

const router = Router()

router.get('/dashboard', handleDashboardStats)
router.get('/queue', handleQueueStatus)
router.get('/', handleGetJobs)

export default router
