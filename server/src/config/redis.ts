import IORedis from 'ioredis'
import config from './env'

export const redis = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null, // required by BullMQ
})

// Fix BullMQ eviction policy warning
redis.on('connect', async () => {
    try {
        await redis.config('SET', 'maxmemory-policy', 'noeviction')
        console.log('✅ Redis connected (eviction policy set to noeviction)')
    } catch {
        console.log('✅ Redis connected (could not set eviction policy — check permissions)')
    }
})

redis.on('error', (err) => console.error('❌ Redis error:', err.message))
