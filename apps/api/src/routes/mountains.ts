import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  domain: z.enum(['BODY', 'MIND', 'WORLD']),
  presence: z.enum(['CLIMBING', 'WALKING', 'IN_SIGHT']).default('WALKING'),
})

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  presence: z.enum(['CLIMBING', 'WALKING', 'IN_SIGHT']).optional(),
})

export async function mountainRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    return prisma.mountain.findMany({
      where: { userId },
      include: {
        hills: { orderBy: { targetDate: 'asc' } },
        paths: { where: { status: 'ACTIVE' } },
      },
      orderBy: { createdAt: 'asc' },
    })
  })

  app.get('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const mountain = await prisma.mountain.findFirst({
      where: { id, userId },
      include: {
        hills: {
          orderBy: { targetDate: 'asc' },
          include: { paths: true },
        },
        paths: {
          include: {
            steps: { orderBy: { loggedAt: 'desc' }, take: 10 },
          },
        },
      },
    })

    if (!mountain) return reply.status(404).send({ error: 'Not Found', message: 'Mountain not found', statusCode: 404 })
    return mountain
  })

  app.post('/', async (request, reply) => {
    const userId = getUserId(request)
    const body = createSchema.parse(request.body)

    const mountain = await prisma.mountain.create({
      data: { ...body, userId },
    })

    return reply.status(201).send(mountain)
  })

  app.patch('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const body = updateSchema.parse(request.body)

    const existing = await prisma.mountain.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Mountain not found', statusCode: 404 })

    return prisma.mountain.update({ where: { id }, data: body })
  })

  app.delete('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const existing = await prisma.mountain.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Not Found', message: 'Mountain not found', statusCode: 404 })

    await prisma.mountain.delete({ where: { id } })
    return reply.status(204).send()
  })
}
