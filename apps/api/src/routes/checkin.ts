import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { generateWeeklyCheckin } from '../services/ai.js'

const respondSchema = z.object({
  response: z.string().min(1).max(2000),
})

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function checkinRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/weekly', async (request) => {
    const userId = getUserId(request)
    const weekOf = getWeekStart(new Date())

    // Return existing if already generated this week
    const existing = await prisma.checkIn.findUnique({
      where: { userId_weekOf: { userId, weekOf } },
    })
    if (existing) return existing

    // Generate fresh
    const { summary, question } = await generateWeeklyCheckin(userId)
    return prisma.checkIn.create({
      data: { userId, weekOf, aiSummary: summary, aiQuestion: question },
    })
  })

  app.post('/weekly/respond', async (request, reply) => {
    const userId = getUserId(request)
    const { response } = respondSchema.parse(request.body)
    const weekOf = getWeekStart(new Date())

    const checkin = await prisma.checkIn.findUnique({
      where: { userId_weekOf: { userId, weekOf } },
    })
    if (!checkin) return reply.status(404).send({ error: 'Not Found', message: 'No check-in for this week', statusCode: 404 })

    return prisma.checkIn.update({
      where: { id: checkin.id },
      data: { userResponse: response, respondedAt: new Date() },
    })
  })

  app.get('/history', async (request) => {
    const userId = getUserId(request)
    return prisma.checkIn.findMany({
      where: { userId },
      orderBy: { weekOf: 'desc' },
      take: 12,
    })
  })
}
