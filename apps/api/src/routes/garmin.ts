import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { verifyGarminCredentials, syncGarminData } from '../services/garmin.js'

const connectSchema = z.object({
  username: z.string().email(),
  password: z.string().min(1),
})

const syncSchema = z.object({
  days: z.number().int().min(1).max(30).default(7),
})

export async function garminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  // Get connection status
  app.get('/status', async (request) => {
    const userId = getUserId(request)
    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: 'garmin' } },
      select: {
        id: true,
        metadata: true,
        updatedAt: true,
      },
    })

    if (!integration) return { connected: false }

    return {
      connected: true,
      username: (integration.metadata as Record<string, string>)?.username,
      lastSynced: integration.updatedAt,
    }
  })

  // Connect Garmin account
  app.post('/connect', async (request, reply) => {
    const userId = getUserId(request)
    const { username, password } = connectSchema.parse(request.body)

    const valid = await verifyGarminCredentials(username, password)
    if (!valid) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Could not log in to Garmin Connect — check your username and password',
        statusCode: 401,
      })
    }

    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: 'garmin' } },
      create: {
        userId,
        provider: 'garmin',
        accessToken: password,
        metadata: { username },
      },
      update: {
        accessToken: password,
        metadata: { username },
      },
    })

    return { connected: true, username }
  })

  // Disconnect
  app.delete('/disconnect', async (request, reply) => {
    const userId = getUserId(request)
    await prisma.integration.deleteMany({
      where: { userId, provider: 'garmin' },
    })
    return reply.status(204).send()
  })

  // Trigger a manual sync
  app.post('/sync', async (request, reply) => {
    const userId = getUserId(request)
    const { days } = syncSchema.parse(request.body ?? {})

    try {
      const result = await syncGarminData(userId, days)
      return result
    } catch (err) {
      return reply.status(400).send({
        error: 'Sync failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        statusCode: 400,
      })
    }
  })
}
