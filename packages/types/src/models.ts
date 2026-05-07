import { Domain, EnergyLevel, PathStatus, PathType, Presence, StepSource, StepStatus, StepType } from './enums.js'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Mountain {
  id: string
  userId: string
  name: string
  description: string | null
  domain: Domain
  presence: Presence
  createdAt: string
  updatedAt: string
  hills?: Hill[]
  paths?: Path[]
}

export interface Hill {
  id: string
  mountainId: string
  name: string
  targetDate: string
  targetMetric: string | null
  prepWindowDays: number
  energyDemand: string | null
  reflectionPrompt: string | null
  summitedAt: string | null
  result: string | null
  createdAt: string
  updatedAt: string
  mountain?: Mountain
  paths?: Path[]
}

export interface Path {
  id: string
  mountainId: string
  hillId: string | null
  name: string
  description: string | null
  type: PathType
  status: PathStatus
  createdAt: string
  updatedAt: string
  mountain?: Mountain
  hill?: Hill | null
  steps?: Step[]
}

export interface StepAction {
  id: string
  stepId: string
  order: number
  actionName: string
  actionVolume: string | null
  actionEffort: string | null
  instruction: string | null
  doneVolume: string | null
  doneEffort: string | null
  completedAt: string | null
}

export interface Step {
  id: string
  pathId: string | null
  userId: string
  name: string | null
  content: string | null
  type: StepType
  status: StepStatus
  source: StepSource
  emojiRating: string | null
  effortRating: number | null
  qualityRating: number | null
  completionScore: number | null
  aiResponse: string | null
  aiProposed: boolean
  scheduledFor: string | null
  completedAt: string | null
  loggedAt: string
  createdAt: string
  path?: Path | null
  actions?: StepAction[]
}

export interface BiometricSnapshot {
  id: string
  userId: string
  date: string
  hrv: number | null
  sleepScore: number | null
  restingHr: number | null
  stressScore: number | null
  spo2: number | null
  bodyBattery: number | null
  activeCalories: number | null
  steps: number | null
  source: string
  createdAt: string
  weatherState?: WeatherState | null
}

export interface WeatherState {
  id: string
  biometricSnapshotId: string
  energyLevel: EnergyLevel
  narrativeLine: string
  baselineDelta: number | null
  createdAt: string
}

export interface JournalEntry {
  id: string
  userId: string
  content: string
  voiceTranscript: string | null
  createdAt: string
}

export interface CheckIn {
  id: string
  userId: string
  weekOf: string
  aiSummary: string
  aiQuestion: string
  userResponse: string | null
  respondedAt: string | null
  createdAt: string
}

export interface TodayViewItem {
  id: string
  domain: Domain
  title: string
  subtitle: string | null
  type: 'path_step' | 'hill_proximity' | 'deferred' | 'calendar' | 'ai_suggestion' | 'planned_step'
  sourceId: string | null
  scaledNote: string | null
}

export interface TodayView {
  date: string
  weatherState: WeatherState | null
  energyNarrative: string
  items: TodayViewItem[]
}
