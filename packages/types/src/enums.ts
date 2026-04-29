export enum Domain {
  BODY = 'BODY',
  MIND = 'MIND',
  WORLD = 'WORLD',
}

export enum Presence {
  CLIMBING = 'CLIMBING',
  WALKING = 'WALKING',
  IN_SIGHT = 'IN_SIGHT',
}

export enum PathType {
  HILL_DIRECTED = 'HILL_DIRECTED',
  OPEN = 'OPEN',
}

export enum PathStatus {
  ACTIVE = 'ACTIVE',
  RESTING = 'RESTING',
  COMPLETE = 'COMPLETE',
}

export enum StepType {
  PATH = 'PATH',
  FREE = 'FREE',
}

export enum StepSource {
  MANUAL = 'MANUAL',
  VOICE = 'VOICE',
  AUTO = 'AUTO',
}

export enum EnergyLevel {
  CLEAR = 'CLEAR',   // HRV at or above baseline, good sleep
  HAZY = 'HAZY',    // Moderate — slightly below baseline
  FOGGY = 'FOGGY',  // Well below baseline, poor sleep/high stress
}
