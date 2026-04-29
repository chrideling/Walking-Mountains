import type { FastifyReply, FastifyRequest } from 'fastify'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Unauthorized', message: 'Valid token required', statusCode: 401 })
  }
}

export function getUserId(request: FastifyRequest): string {
  const payload = request.user as { id: string }
  return payload.id
}
