import cron from 'node-cron'
import config from '../config/env'
import { fetchAllFeeds } from '../services/feed-fetcher.service'


export function startCron(): void {
    cron.schedule(config.cronSchedule, async () => {
        console.log('\n⏰ Cron triggered — importing feeds...')
        await fetchAllFeeds(config.jobFeedUrls)
        console.log('⏰ Cron cycle done.\n')
    })
    console.log(`⏰ Cron scheduled: ${config.cronSchedule}`)
}
