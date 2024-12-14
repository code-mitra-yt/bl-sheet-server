import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'

import { ENV } from './config'
import { connectDB } from './db'
import { MSG } from './constants/msg'
import { errorHandler } from './middlewares'
import { logger, morganMiddleware } from './logger'
import { ApiResponse, asyncHandler } from './utils'
import {
  authRoutes,
  budgetRoutes,
  docRoutes,
  issueRoutes,
  memberRoutes,
  projectRoutes,
  taskRoutes,
} from './routes'

const app = express()
app.use(morganMiddleware)

const corsOption: cors.CorsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOption))
app.options('*', cors(corsOption))
app.use(express.json())
app.use(express.static('public'))

const startServer = async () => {
  const PORT = ENV.PORT || 5500
  try {
    connectDB()
    logger.info({ msg: MSG.DB_CONNECTED })
    app.listen(PORT, () =>
      logger.info({ msg: `Server listening on http://localhost:${PORT}` })
    )
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error: error.message })
      process.exit(1)
    }
  }
}

app.get(
  '/',
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    return res
      .status(200)
      .json(new ApiResponse(200, { msg: 'Hello from server!' }))
  })
)

app.use('/api/v1/auth', authRoutes)

app.use('/api/v1/project', projectRoutes)
app.use('/api/v1/project/task', taskRoutes)
app.use('/api/v1/project/issue', issueRoutes)
app.use('/api/v1/project/member', memberRoutes)
app.use('/api/v1/project/budget', budgetRoutes)
app.use('/api/v1/project/doc', docRoutes)

void startServer()
//@ts-ignore
app.use(errorHandler)

export default app
