import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { generateStepResponse, generateProposedSteps } from '../services/ai.js'

const actionInputSchema = z.object({
  actionName: z.string().min(1).max(200),
  actionVolume: z.string().max(100).optional(),
  actionEffort: z.string().max(100).optional(),
  instruction: z.string().max(1000).optional(),
})

const createSchema = z
  .object({
    pathId: z.string().optional(),
    name: z.string().min(1).max(500).optional(),
    content: z.string().min(1).max(2000).optional(),
    type: z.enum(['PATH', 'FREE']),
    status: z.enum(['PLANNED', 'DONE']).default('DONE'),
    source: z.enum(['MANUAL', 'VOICE', 'AUTO']).default('MANUAL'),
    emojiRating: z.string().max(10).optional(),
    scheduledFor: z.string().datetime().optional(),
    loggedAt: z.string().datetime().optional(),
    actions: z.array(actionInputSchema).max(30).optional(),
  })
  .refine((d) => d.content || d.name, { message: 'Either content or name is required' })
  .refine((d) => d.status !== 'PLANNED' || !!d.scheduledFor, {
    message: 'scheduledFor is required for PLANNED steps',
  })

const completeActionSchema = z.object({
  actionId: z.string(),
  completed: z.boolean(),
  doneVolume: z.string().max(100).optional(),
  doneEffort: z.string().max(100).optional(),
})

const completeSchema = z.object({
  effortRating: z.number().int().min(1).max(5),
  qualityRating: z.number().int().min(1).max(5),
  emojiRating: z.string().max(10).optional(),
  actions: z.array(completeActionSchema).optional(),
})

const updateActionSchema = z.object({
  completed: z.boolean(),
  doneVolume: z.string().max(100).optional(),
  doneEffort: z.string().max(100).optional(),
})

const proposeSchema = z.object({
  pathId: z.string(),
  count: z.number().int().min(1).max(7).default(3),
  context: z.string().max(500).optional(),
})

const stepInclude = {
  path: { include: { mountain: { select: { id: true, name: true, domain: true } } } },
  actions: { orderBy: { order: 'asc' as const } },
}

export async function stepRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    const { pathId, mountainId, type, status, limit, since } = request.query as {
      pathId?: string
      mountainId?: string
      type?: string
      status?: string
      limit?: string
      since?: string
    }

    return prisma.step.findMany({
      where: {
        userId,
        ...(pathId ? { pathId } : {}),
        ...(mountainId ? { path: { mountainId } } : {}),
        ...(type ? { type: type as 'PATH' | 'FREE' } : {}),
        ...(status ? { status: status as 'PLANNED' | 'DONE' } : {}),
        ...(since ? { loggedAt: { gte: new Date(since) } } : {}),
      },
      include: stepInclude,
      orderBy: { loggedAt: 'desc' },
      take: limit ? parseInt(limit) : 100,
    })
  })

  // Summary stats for a path or mountain
  app.get('/stats', async (request) => {
    const userId = getUserId(request)
    const { pathId, mountainId } = request.query as { pathId?: string; mountainId?: string }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - 7)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const baseWhere = {
      userId,
      ...(pathId ? { pathId } : {}),
      ...(mountainId ? { path: { mountainId } } : {}),
    }

    const [todaySteps, weekSteps, plannedCount] = await Promise.all([
      prisma.step.findMany({
        where: { ...baseWhere, status: 'DONE', loggedAt: { gte: today } },
        orderBy: { loggedAt: 'desc' },
        include: {
          path: { select: { id: true, name: true, mountainId: true } },
          actions: { orderBy: { order: 'asc' } },
        },
      }),
      prisma.step.count({
        where: { ...baseWhere, status: 'DONE', loggedAt: { gte: weekStart } },
      }),
      prisma.step.count({
        where: { ...baseWhere, status: 'PLANNED', scheduledFor: { gte: today, lt: nextWeek } },
      }),
    ])

    return { todaySteps, todayCount: todaySteps.length, weekCount: weekSteps, plannedCount }
  })

  // AI-propose steps for a path (synchronous — user is waiting for suggestions)
  app.post('/propose', async (request, reply) => {
    const userId = getUserId(request)
    const body = proposeSchema.parse(request.body)

    const path = await prisma.path.findFirst({
      where: { id: body.pathId, mountain: { userId } },
    })
    if (!path) return reply.status(404).send({ error: 'Not Found', message: 'Path not found', statusCode: 404 })

    const steps = await generateProposedSteps(userId, body.pathId, body.count, body.context ?? null)
    return { steps }
  })

  app.post('/', async (request, reply) => {
    const userId = getUserId(request)
    const body = createSchema.parse(request.body)

    if (body.pathId) {
      const path = await prisma.path.findFirst({ where: { id: body.pathId, mountain: { userId } } })
      if (!path) return reply.status(404).send({ error: 'Not Found', message: 'Path not found', statusCode: 404 })
    }

    // FREE steps are always DONE
    const status = body.type === 'FREE' ? 'DONE' : body.status

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
        name: body.name,
        content: body.content,
        type: body.type,
        status,
        source: body.source,
        emojiRating: body.emojiRating,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
        actions: body.actions
          ? { create: body.actions.map((a, i) => ({ ...a, order: i })) }
          : undefined,
      },
      include: stepInclude,
    })

    // Only generate AI response for immediately done steps
    if (status === 'DONE') {
      const stepSummary = step.name
        ? `${step.name}${step.actions?.length ? ': ' + step.actions.map((a) => a.actionName).join(', ') : ''}`
        : (step.content ?? '')
      generateStepResponse(userId, step.id, stepSummary, snapshot?.weatherState ?? null)
        .then(async (aiResponse) => {
          if (aiResponse) {
            await prisma.step.update({ where: { id: step.id }, data: { aiResponse } })
          }
        })
        .catch(() => {})
    }

    return reply.status(201).send(step)
  })

  // Complete a PLANNED step → DONE
  app.post('/:id/complete', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const body = completeSchema.parse(request.body)

    const step = await prisma.step.findFirst({
      where: { id, userId },
      include: { actions: true },
    })
    if (!step) return reply.status(404).send({ error: 'Not Found', message: 'Step not found', statusCode: 404 })
    if (step.status !== 'PLANNED') {
      return reply.status(409).send({ error: 'Conflict', message: 'Step is not in PLANNED state', statusCode: 409 })
    }

    if (body.actions?.length) {
      await Promise.all(
        body.actions.map((a) =>
          prisma.stepAction.update({
            where: { id: a.actionId },
            data: {
              completedAt: a.completed ? new Date() : null,
              doneVolume: a.doneVolume,
              doneEffort: a.doneEffort,
            },
          })
        )
      )
    }

    const totalActions = step.actions.length
    const completedCount = body.actions ? body.actions.filter((a) => a.completed).length : totalActions
    const completionScore = totalActions === 0 ? 100 : Math.round((completedCount / totalActions) * 100)

    const updatedStep = await prisma.step.update({
      where: { id },
      data: {
        status: 'DONE',
        completedAt: new Date(),
        effortRating: body.effortRating,
        qualityRating: body.qualityRating,
        emojiRating: body.emojiRating,
        completionScore,
      },
      include: stepInclude,
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const snapshot = await prisma.biometricSnapshot.findFirst({
      where: { userId, date: today },
      include: { weatherState: true },
    })
    const stepSummary = `${updatedStep.name ?? updatedStep.content ?? 'step'} (${completionScore}% complete, effort ${body.effortRating}/5)`
    generateStepResponse(userId, updatedStep.id, stepSummary, snapshot?.weatherState ?? null)
      .then(async (aiResponse) => {
        if (aiResponse) {
          await prisma.step.update({ where: { id: updatedStep.id }, data: { aiResponse } })
        }
      })
      .catch(() => {})

    return updatedStep
  })

  // Real-time action check-off during execution
  app.patch('/:id/actions/:actionId', async (request, reply) => {
    const userId = getUserId(request)
    const { id, actionId } = request.params as { id: string; actionId: string }
    const body = updateActionSchema.parse(request.body)

    const step = await prisma.step.findFirst({ where: { id, userId } })
    if (!step) return reply.status(404).send({ error: 'Not Found', message: 'Step not found', statusCode: 404 })

    const action = await prisma.stepAction.update({
      where: { id: actionId },
      data: {
        completedAt: body.completed ? new Date() : null,
        doneVolume: body.doneVolume,
        doneEffort: body.doneEffort,
      },
    })
    return action
  })

  app.get('/:id', async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const step = await prisma.step.findFirst({
      where: { id, userId },
      include: { path: { include: { mountain: true } }, actions: { orderBy: { order: 'asc' } } },
    })

    if (!step) return reply.status(404).send({ error: 'Not Found', message: 'Step not found', statusCode: 404 })
    return step
  })
}
