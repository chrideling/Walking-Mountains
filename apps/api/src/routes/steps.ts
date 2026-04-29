import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { generateStepResponse } from '../services/ai.js'

const createSchema = z.object({
  pathId: z.string().optional(),
  content: z.string().min(1).max(2000),
  type: z.enum(['PATH', 'FREE']),
  source: z.enum(['MANUAL', 'VOICE', 'AUTO']).default('MANUAL'),
  emojiRating: z.string().max(10).optional(),
  loggedAt: z.string().datetime().optional(),
})

export async function stepRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    const { pathId, type, limit } = request.query as { pathId?: string; type?: string; limit?: string }

    return prisma.step.findMany({
      where: {
        userId,
        ...(pathId ? { pathId } : {}),
        ...(type ? { type: type as 'PATH' | 'FREE' } : {}),
      },
      include: {
        path: { include: { mountain: { select: { id: true, name: true, domain: true } } } },
      },
      orderBy: { loggedAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    })
  })

  app.post('/', async (request, reply) => {
    const userId = getUserId(request)
    const body = createSchema.parse(request.body)

    if (body.pathId) {
      const path = await prisma.path.findFirst({ where: { id: body.pathId, mountain: { userId } } })
      if (!path) return reply.status(404).send({ error: 'Not Found', message: 'Path not found', statusCode: 404 })
    }

    // Get today's weather + context for AI response
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const snapshot = await prisma.biometricSnapshot.findFirst({
      where: { userId, date: today },
      include: { weatherState: true },
    })

    const step = await prisma.step.create({
      data: {
        userId,
        pathId: body.pathId,
        content: body.content,
        type: body.type,
        source: body.source,
        emojiRating: body.emojiRating,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
      include: {
        path: { include: { mountain: { select: { id: true, name: true, domain: true } } } },
      },
    })

    // Generate brief AI response asynchronously — update step when done
    generateStepResponse(userId, step.id, body.content, snapshot?.weatherState ?? null)
      .then(async (aiResponse) => {
        if (aiResponse) {
          await prisma.step.update({ where: { id: step.id }, data: { aiResponse } })
        }
      })
      .catch(() => {
        // Non-critical — step is logged regardless
      })

    return reply.status(201).send(step)
  })

  app.get('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const step = await prisma.step.findFirst({
      where: { id, userId },
      include: {
        path: { include: { mountain: true } },
      },
    })

    if (!step) return reply.status(404).send({ error: 'Not Found', message: 'Step not found', statusCode: 404 })
    return step
  })
}
