import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'

const createSchema = z.object({
  mountainId: z.string(),
  name: z.string().min(1).max(200),
  targetDate: z.string().datetime(),
  targetMetric: z.string().max(200).optional(),
  prepWindowDays: z.number().int().min(1).max(365).default(42),
  energyDemand: z.string().max(500).optional(),
  reflectionPrompt: z.string().max(500).optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  targetDate: z.string().datetime().optional(),
  targetMetric: z.string().max(200).optional(),
  prepWindowDays: z.number().int().min(1).max(365).optional(),
  energyDemand: z.string().max(500).optional(),
  reflectionPrompt: z.string().max(500).optional(),
  summitedAt: z.string().datetime().optional(),
  result: z.string().max(2000).optional(),
})

export async function hillRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    const { mountainId } = request.query as { mountainId?: string }

    return prisma.hill.findMany({
      where: {
        mountain: { userId },
        ...(mountainId ? { mountainId } : {}),
      },
      include: { mountain: { select: { id: true, name: true, domain: true } } },
      orderBy: { targetDate: 'asc' },
    })
  })

  app.get('/upcoming', async (request) => {
    const userId = getUserId(request)
    const now = new Date()
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    return prisma.hill.findMany({
      where: {
        mountain: { userId },
        targetDate: { gte: now, lte: in90Days },
        summitedAt: null,
      },
      include: { mountain: { select: { id: true, name: true, domain: true, presence: true } } },
      orderBy: { targetDate: 'asc' },
    })
  })

  app.get('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const hill = await prisma.hill.findFirst({
      where: { id, mountain: { userId } },
      include: {
        mountain: true,
        paths: { include: { steps: { orderBy: { loggedAt: 'desc' }, take: 5 } } },
      },
    })

    if (!hill) return reply.status(404).send({ error: 'Not Found', message: 'Hill not found', statusCode: 404 })
    return hill
  })

  app.post('/', async (request, reply) => {
    const userId = getUserId(request)
    const body = createSchema.parse(request.body)

    const mountain = await prisma.mountain.findFirst({ where: { id: body.mountainId, userId } })
    if (!mountain) return reply.status(404).send({ error: 'Not Found', message: 'Mountain not found', statusCode: 404 })

    const hill = await prisma.hill.create({ data: { ...body, targetDate: new Date(body.targetDate) } })
    return reply.status(201).send(hill)
  })

  app.patch('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const body = updateSchema.parse(request.body)

    const existing = await prisma.hill.findFirst({ where: { id, mountain: { userId } } })
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Hill not found', statusCode: 404 })

    return prisma.hill.update({
      where: { id },
      data: {
        ...body,
        ...(body.targetDate ? { targetDate: new Date(body.targetDate) } : {}),
        ...(body.summitedAt ? { summitedAt: new Date(body.summitedAt) } : {}),
      },
    })
  })

  app.delete('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const existing = await prisma.hill.findFirst({ where: { id, mountain: { userId } } })
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Hill not found', statusCode: 404 })

    await prisma.hill.delete({ where: { id } })
    return reply.status(204).send()
  })
}
