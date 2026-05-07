import { Domain, EnergyLevel, PathStatus, PathType, Presence, StepSource, StepStatus, StepType } from './enums.js'

// Auth
export interface RegisterBody {
  email: string
  name: string
  password: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
  }
}

export interface RefreshBody {
  refreshToken: string
}

// Mountains
export interface CreateMountainBody {
  name: string
  description?: string
  domain: Domain
  presence?: Presence
}

export interface UpdateMountainBody {
  name?: string
  description?: string
  presence?: Presence
}

// Hills
export interface CreateHillBody {
  mountainId: string
  name: string
  targetDate: string
  targetMetric?: string
  prepWindowDays?: number
  energyDemand?: string
  reflectionPrompt?: string
}

export interface UpdateHillBody {
  name?: string
  targetDate?: string
  targetMetric?: string
  prepWindowDays?: number
  energyDemand?: string
  reflectionPrompt?: string
  summitedAt?: string
  result?: string
}

// Paths
export interface CreatePathBody {
  mountainId: string
  hillId?: string
  name: string
  description?: string
  type: PathType
}

export interface UpdatePathBody {
  name?: string
  description?: string
  status?: PathStatus
}

// Steps
export interface StepActionInput {
  actionName: string
  actionVolume?: string
  actionEffort?: string
  instruction?: string
}

export interface CreateStepBody {
  pathId?: string
  name?: string
  content?: string
  type: StepType
  status?: StepStatus
  source?: StepSource
  emojiRating?: string
  scheduledFor?: string
  loggedAt?: string
  actions?: StepActionInput[]
}

export interface CompleteActionInput {
  actionId: string
  completed: boolean
  doneVolume?: string
  doneEffort?: string
}

export interface CompleteStepBody {
  effortRating: number
  qualityRating: number
  emojiRating?: string
  actions?: CompleteActionInput[]
}

export interface UpdateStepActionBody {
  completed: boolean
  doneVolume?: string
  doneEffort?: string
}

export interface ProposeStepsBody {
  pathId: string
  count?: number
  context?: string
}

export interface ProposedStep {
  name: string
  scheduledFor: string
  actions: StepActionInput[]
}

export interface ProposeStepsResponse {
  steps: ProposedStep[]
}

// Biometrics
export interface CreateBiometricBody {
  date: string
  hrv?: number
  sleepScore?: number
  restingHr?: number
  stressScore?: number
  spo2?: number
  bodyBattery?: number
  activeCalories?: number
  steps?: number
  source?: string
}

// Check-in
export interface RespondToCheckInBody {
  response: string
}

// AI
export interface AIChatBody {
  message: string
}

export interface AIChatResponse {
  reply: string
}

// Generic
export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}
