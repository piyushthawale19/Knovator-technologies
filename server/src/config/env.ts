import dotenv from 'dotenv'
dotenv.config()

const DEFAULT_FEED_URLS = [
    'https://jobicy.com/?feed=job_feed',
    'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
    'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
    'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
    'https://jobicy.com/?feed=job_feed&job_categories=data-science',
    'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
    'https://jobicy.com/?feed=job_feed&job_categories=business',
    'https://jobicy.com/?feed=job_feed&job_categories=management',
    'https://www.higheredjobs.com/rss/articleFeed.cfm',
]

const config = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfeed',

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },

    queue: {
        concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
        maxRetries: Number(process.env.QUEUE_MAX_RETRIES) || 3,
    },

    cronSchedule: process.env.CRON_SCHEDULE || '0 * * * *',

    jobFeedUrls: process.env.JOB_FEED_URLS
        ? process.env.JOB_FEED_URLS.split(',').filter(Boolean)
        : DEFAULT_FEED_URLS,

    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const

export default config
