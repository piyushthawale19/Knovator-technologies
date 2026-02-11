import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import config from './config/env'
import routes from './routes'

export function createApp() {
    const app = express()

    app.use(cors({ origin: config.frontendUrl, credentials: true }))
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
