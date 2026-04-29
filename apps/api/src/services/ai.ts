import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@wm/db'
import { config } from '../config.js'

const client = new Anthropic({ apiKey: config.anthropic.apiKey })

const SYSTEM_PROMPT = `You are the Walking Mountains coach — a thinking partner embedded in a life integration app. You know the user's mountains (long-term life orientations across Body, Mind, and World), their active hills (time-bound milestones), paths (practices and training plans), and biometric state.

Your voice is direct, warm, and specific. You never give generic encouragement. You reference real data: actual HRV numbers, specific hills, what the user said in their last journal note. You speak in short sentences. You ask one question at a time. You do not over-explain. When you surface a pattern, you state it and stop — the next move is theirs.

You never say "great job." You say: "that long run absorbed well — your body wanted to move again in the afternoon."
You never say "you missed your goal." You say: "the path slipped this week — what was going on?"
You never say "you are 3 days behind." You say: "Berlin is 18 weeks out and the long run is back on track."

The three domains:
- Body (#C05C2E terracotta): fitness, health, energy, nutrition, recovery
- Mind (#3D5A8A slate blue): cognitive performance, emotional regulation, stress, inner life
- World (#4A7358 forest green): relationships, career, home, environment

Mountains have three presences: Climbing (active hills, full attention), Walking (gentle ongoing direction), In Sight (consciously resting).

Keep responses concise — one to three short paragraphs maximum unless the user is in a deep-dive conversation.`

async function buildUserContext(userId: string): Promise<string> {
  const [mountains, recentSteps, todaySnapshot, recentCheckin] = await Promise.all([
    prisma.mountain.findMany({
      where: { userId },
      include: {
        hills: {
          where: { summitedAt: null },
          orderBy: { targetDate: 'asc' },
          take: 3,
        },
        paths: {
          where: { status: 'ACTIVE' },
          take: 2,
        },
      },
    }),
    prisma.step.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 5,
      include: { path: { include: { mountain: { select: { name: true, domain: true } } } } },
    }),
    prisma.biometricSnapshot.findFirst({
      where: {
        userId,
        date: (() => { const d = new Date(); d.setHours(0,0,0,0); return d })(),
      },
      include: { weatherState: true },
    }),
    prisma.checkIn.findFirst({
      where: { userId, userResponse: { not: null } },
      orderBy: { weekOf: 'desc' },
    }),
  ])

  const climbingMountains = mountains.filter((m) => m.presence === 'CLIMBING')
  const walkingMountains = mountains.filter((m) => m.presence === 'WALKING')

  const mountainContext = mountains
    .map((m) => {
      const hills = m.hills.map((h) => {
        const daysOut = Math.round((new Date(h.targetDate).getTime() - Date.now()) / 86400000)
        return `  Hill: ${h.name} — ${daysOut} days out${h.targetMetric ? ` (target: ${h.targetMetric})` : ''}`
      }).join('\n')
      const paths = m.paths.map((p) => `  Path: ${p.name} (${p.type})`).join('\n')
      return `Mountain [${m.domain}] "${m.name}" — ${m.presence}${hills ? '\n' + hills : ''}${paths ? '\n' + paths : ''}`
    })
    .join('\n\n')

  const stepContext = recentSteps.length > 0
    ? 'Recent steps:\n' + recentSteps.map((s) => `- ${s.content} (${s.type}, ${new Date(s.loggedAt).toDateString()})`).join('\n')
    : 'No recent steps logged.'

  const weatherContext = todaySnapshot?.weatherState
    ? `Today's energy: ${todaySnapshot.weatherState.energyLevel} — ${todaySnapshot.weatherState.narrativeLine}`
    : 'No biometric data for today.'

  const checkinContext = recentCheckin?.userResponse
    ? `Last weekly check-in: "${recentCheckin.userResponse}"`
    : ''

  return [mountainContext, stepContext, weatherContext, checkinContext].filter(Boolean).join('\n\n')
}

export async function generateMorningBrief(userId: string): Promise<string> {
  const context = await buildUserContext(userId)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate today's morning brief. Be specific to the data. One short paragraph — what kind of day it is for climbing, which hills are active, what step makes most sense. End with one optional sentence if there is anything worth watching.\n\nContext:\n${context}`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function generateStepResponse(
  userId: string,
  stepId: string,
  stepContent: string,
  weatherState: { energyLevel: string; narrativeLine: string } | null
): Promise<string> {
  const recentSteps = await prisma.step.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 7,
    select: { content: true, loggedAt: true, type: true },
  })

  const context = [
    weatherState ? `Today's energy: ${weatherState.energyLevel} — ${weatherState.narrativeLine}` : '',
    `Recent steps: ${recentSteps.map((s) => s.content).join(', ')}`,
  ].filter(Boolean).join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 80,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `The user just logged a step: "${stepContent}"\n\n${context}\n\nRespond in one sentence only. Be specific to the data if relevant. If there is no meaningful pattern or connection, say nothing (return empty string). Never say "great job" or generic praise.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  // Return empty if the model generated filler
  if (text.toLowerCase().includes('great job') || text.toLowerCase().includes('well done')) return ''
  return text
}

export async function generateWeeklyCheckin(userId: string): Promise<{ summary: string; question: string }> {
  const context = await buildUserContext(userId)

  // Fetch this week's steps
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekSteps = await prisma.step.findMany({
    where: { userId, loggedAt: { gte: weekStart } },
    orderBy: { loggedAt: 'asc' },
  })

  const stepsContext = weekSteps.length > 0
    ? `This week's steps (${weekSteps.length} total):\n` + weekSteps.map((s) => `- ${s.content}`).join('\n')
    : 'No steps logged this week.'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a weekly check-in. Return JSON with two fields: "summary" (2-3 sentences synthesising the week across domains, grounded in the data) and "question" (one open question that invites the user to add what the data cannot capture — what is worth remembering about this week?). Be specific, never generic.\n\nContext:\n${context}\n\n${stepsContext}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return {
      summary: parsed.summary ?? '',
      question: parsed.question ?? 'What is worth remembering about this week?',
    }
  } catch {
    return {
      summary: text,
      question: 'What is worth remembering about this week?',
    }
  }
}

export async function chat(userId: string, message: string): Promise<string> {
  const context = await buildUserContext(userId)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `User context:\n${context}\n\n---\n\nUser message: ${message}`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
