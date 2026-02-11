import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import config from './config/env'
import routes from './routes'

export function createApp() {
    const app = express()

    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true)

                const allowedOrigins = [
                    'http://localhost:3000',
                    'http://localhost:3001',
                    config.frontendUrl,
                ]

                if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            },
            credentials: true,
        })
    )
    app.use(morgan('dev'))
    app.use(express.json())

    app.use('/api', routes)

    app.get('/', (req, res) => {
        res.send('API Running')
    })

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' })
    })

    return app
}
