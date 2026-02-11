import { Router } from 'express'
import { handleTriggerImport } from '../controllers/job.controller'

const router = Router()

router.post('/trigger', handleTriggerImport)

export default router
