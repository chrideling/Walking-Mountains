import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@wm/db'
import { config } from '../config.js'
import { requireAuth, getUserId } from '../middleware/auth.js'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

function makeTokens(app: FastifyInstance, userId: string) {
  const accessToken = app.jwt.sign(
    { id: userId },
    { expiresIn: config.jwt.expiresIn }
  )
  const refreshToken = app.jwt.sign(
    { id: userId, type: 'refresh' },
    { secret: config.jwt.refreshSecret, expiresIn: config.jwt.refreshExpiresIn }
  )
  return { accessToken, refreshToken }
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
      return reply.status(409).send({ error: 'Conflict', message: 'Email already registered', statusCode: 409 })
    }

    const passwordHash = await bcrypt.hash(body.password, 12)
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash },
      select: { id: true, email: true, name: true },
    })

    const { accessToken, refreshToken } = makeTokens(app, user.id)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return reply.status(201).send({ accessToken, refreshToken, user })
  })

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid credentials', statusCode: 401 })
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid credentials', statusCode: 401 })
    }

    const { accessToken, refreshToken } = makeTokens(app, user.id)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } }
  })

  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body)

    let payload: { id: string; type: string }
    try {
      payload = app.jwt.verify(refreshToken, { secret: config.jwt.refreshSecret }) as typeof payload
    } catch {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid refresh token', statusCode: 401 })
    }

    if (payload.type !== 'refresh') {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid token type', statusCode: 401 })
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Refresh token expired', statusCode: 401 })
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const tokens = makeTokens(app, payload.id)
    await prisma.refreshToken.create({
      data: {
        userId: payload.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return tokens
  })

  app.get('/me', { preHandler: requireAuth }, async (request) => {
    const userId = getUserId(request)
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    })
    return user
  })

  app.post('/logout', { preHandler: requireAuth }, async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body)
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    return reply.status(204).send()
  })
}
