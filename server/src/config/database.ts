import mongoose from 'mongoose'
import config from './env'

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(config.mongodbUri, {
            serverSelectionTimeoutMS: 10_000,
            connectTimeoutMS: 10_000,
        })
        console.log('✅ MongoDB connected')
    } catch (err) {
        console.error('❌ MongoDB connection error:', err)
        process.exit(1)
    }
}
