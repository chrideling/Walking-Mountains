import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { config } from './config.js'
import { authRoutes } from './routes/auth.js'
import { mountainRoutes } from './routes/mountains.js'
import { hillRoutes } from './routes/hills.js'
import { pathRoutes } from './routes/paths.js'
import { stepRoutes } from './routes/steps.js'
import { todayRoutes } from './routes/today.js'
import { checkinRoutes } from './routes/checkin.js'
import { aiRoutes } from './routes/ai.js'
import { biometricRoutes } from './routes/biometrics.js'
import { garminRoutes } from './routes/garmin.js'

const app = Fastify({
  logger: {
    transport:
      config.nodeEnv === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

await app.register(cors, {
  origin: config.frontendUrl,
  credentials: true,
})

await app.register(jwt, {
  secret: config.jwt.secret,
})

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// Routes
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(mountainRoutes, { prefix: '/api/mountains' })
await app.register(hillRoutes, { prefix: '/api/hills' })
await app.register(pathRoutes, { prefix: '/api/paths' })
await app.register(stepRoutes, { prefix: '/api/steps' })
await app.register(todayRoutes, { prefix: '/api/today' })
await app.register(checkinRoutes, { prefix: '/api/checkin' })
await app.register(aiRoutes, { prefix: '/api/ai' })
await app.register(biometricRoutes, { prefix: '/api/biometrics' })
await app.register(garminRoutes, { prefix: '/api/garmin' })

app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

try {
  await app.listen({ port: config.port, host: config.host })
  console.log(`Walking Mountains API running on port ${config.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
