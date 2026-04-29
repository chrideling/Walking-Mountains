import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth, getUserId } from '../middleware/auth.js'
import { chat } from '../services/ai.js'

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
})

export async function aiRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  app.post('/chat', async (request) => {
    const userId = getUserId(request)
    const { message } = chatSchema.parse(request.body)
    const reply = await chat(userId, message)
    return { reply }
  })
}
