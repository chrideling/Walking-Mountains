import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'

const createSchema = z.object({
  mountainId: z.string(),
  hillId: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['HILL_DIRECTED', 'OPEN']),
})

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'RESTING', 'COMPLETE']).optional(),
})

export async function pathRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    const { mountainId, status } = request.query as { mountainId?: string; status?: string }

    return prisma.path.findMany({
      where: {
        mountain: { userId },
        ...(mountainId ? { mountainId } : {}),
        ...(status ? { status: status as 'ACTIVE' | 'RESTING' | 'COMPLETE' } : {}),
      },
      include: {
        mountain: { select: { id: true, name: true, domain: true } },
        hill: { select: { id: true, name: true, targetDate: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  })

  app.get('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const path = await prisma.path.findFirst({
      where: { id, mountain: { userId } },
      include: {
        mountain: true,
        hill: true,
        steps: { orderBy: { loggedAt: 'desc' }, take: 20 },
      },
    })

    if (!path) return reply.status(404).send({ error: 'Not Found', message: 'Path not found', statusCode: 404 })
    return path
  })

  app.post('/', async (request, reply) => {
    const userId = getUserId(request)
    const body = createSchema.parse(request.body)

    const mountain = await prisma.mountain.findFirst({ where: { id: body.mountainId, userId } })
    if (!mountain) return reply.status(404).send({ error: 'Not Found', message: 'Mountain not found', statusCode: 404 })

    if (body.hillId) {
      const hill = await prisma.hill.findFirst({ where: { id: body.hillId, mountain: { userId } } })
      if (!hill) return reply.status(404).send({ error: 'Not Found', message: 'Hill not found', statusCode: 404 })
    }

    const path = await prisma.path.create({ data: body })
    return reply.status(201).send(path)
  })

  app.patch('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const body = updateSchema.parse(request.body)

    const existing = await prisma.path.findFirst({ where: { id, mountain: { userId } } })
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Path not found', statusCode: 404 })

    return prisma.path.update({ where: { id }, data: body })
  })

  app.delete('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const existing = await prisma.path.findFirst({ where: { id, mountain: { userId } } })
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Path not found', statusCode: 404 })

    await prisma.path.delete({ where: { id } })
    return reply.status(204).send()
  })
}
