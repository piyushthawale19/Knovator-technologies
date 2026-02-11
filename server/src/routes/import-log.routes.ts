import { Router } from 'express'
import { handleGetImportLogs } from '../controllers/import-log.controller'

const router = Router()

router.get('/', handleGetImportLogs)

export default router
