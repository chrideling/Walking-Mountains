import type { FastifyInstance } from 'fastify'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { assembleTodayView } from '../services/today.js'
import { generateMorningBrief } from '../services/ai.js'

export async function todayRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.get('/', async (request) => {
    const userId = getUserId(request)
    return assembleTodayView(userId)
  })

  app.get('/brief', async (request) => {
    const userId = getUserId(request)
    const brief = await generateMorningBrief(userId)
    return { brief }
  })
}
