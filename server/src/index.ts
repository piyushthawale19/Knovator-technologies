import { createApp } from './app'
import config from './config/env'
import { connectDatabase } from './config/database'
import { startWorker } from './workers/job.worker'
import { startCron } from './cron/scheduler'

async function main() {
    await connectDatabase()

    startWorker()
    startCron()

    const app = createApp()
    app.listen(config.port, () => {
        console.log(`🚀 Server running → http://localhost:${config.port}/api`)
    })
}

main().catch((err) => {
    console.error('Fatal:', err)
    process.exit(1)
})
