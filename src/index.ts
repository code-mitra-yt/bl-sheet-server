import cors from 'cors'
import express from 'express'

import { ENV, logger, connectDB } from './config'
import { MSG } from './constants'

const app = express()

const corsOption: cors.CorsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOption))
app.options('*', cors(corsOption))

const startServer = async () => {
  const PORT = ENV.PORT || 5500
  try {
    connectDB()
    logger.info({ msg: MSG.DB_CONNECTED })
    app.listen(PORT, () => logger.info({ msg: `Server listening on ${PORT}` }))
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error: error.message })
      process.exit(1)
    }
  }
}

void startServer()

app.use(express.json())
app.use(express.static('public'))

export default app
