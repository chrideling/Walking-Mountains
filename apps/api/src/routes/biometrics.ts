import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { computeWeatherState } from '../services/weather.js'

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hrv: z.number().positive().optional(),
  sleepScore: z.number().int().min(0).max(100).optional(),
  restingHr: z.number().int().positive().optional(),
  stressScore: z.number().int().min(0).max(100).optional(),
  spo2: z.number().min(80).max(100).optional(),
  bodyBattery: z.number().int().min(0).max(100).optional(),
  activeCalories: z.number().int().min(0).optional(),
  steps: z.number().int().min(0).optional(),
  source: z.string().default('manual'),
})

export async function biometricRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    const { days } = request.query as { days?: string }
    const limit = days ? parseInt(days) : 14
    const since = new Date()
    since.setDate(since.getDate() - limit)

    return prisma.biometricSnapshot.findMany({
      where: { userId, date: { gte: since } },
      include: { weatherState: true },
      orderBy: { date: 'desc' },
    })
  })

  app.get('/today', async (request) => {
    const userId = getUserId(request)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.biometricSnapshot.findFirst({
      where: { userId, date: today },
      include: { weatherState: true },
    })
  })

  app.post('/', async (request, reply) => {
    const userId = getUserId(request)
    const body = createSchema.parse(request.body)

    const date = new Date(body.date)
    date.setUTCHours(0, 0, 0, 0)

    const snapshot = await prisma.biometricSnapshot.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, ...body, date },
      update: body,
    })

    // Compute and store weather state
    const weather = await computeWeatherState(userId, snapshot)
    if (weather) {
      await prisma.weatherState.upsert({
        where: { biometricSnapshotId: snapshot.id },
        create: { biometricSnapshotId: snapshot.id, ...weather },
        update: weather,
      })
    }

    return reply.status(201).send(
      await prisma.biometricSnapshot.findUnique({
        where: { id: snapshot.id },
        include: { weatherState: true },
      })
    )
  })
}
