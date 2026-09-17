export type TrainingMode = 'GREEN' | 'AMBER' | 'RESET' | 'RECOVERY'
export type RunningStage = 'BASE' | 'CAPACITY' | 'RETURN' | 'RUNNER'
export type WorkoutId = 'strength-a' | 'strength-b'
export type Effort = 'easy' | 'good' | 'hard'

export interface UserProfile {
  id: string
  displayName: string
  baselineWeightKg: number
  directionWeightKg: number
  runningStage: RunningStage
  createdAt: string
}

export interface ExerciseDefinition {
  id: string
  name: string
  category: 'warmup' | 'strength' | 'cardio'
  muscles: string[]
  why: string
  how: string
  avoid: string
  referenceImage?: string
  defaultRepGuidance: string
  cardioFields?: ('duration' | 'speed' | 'incline')[]
}

export interface WorkoutExercise {
  exerciseId: string
  sets?: number
  repGuidance: string
  optional?: boolean
}

export interface WorkoutDefinition {
  id: WorkoutId
  title: string
  subtitle: string
  estimatedMinutes: Record<'GREEN' | 'AMBER' | 'RESET', number>
  exercises: WorkoutExercise[]
  modeExerciseIds: Partial<Record<'AMBER' | 'RESET', string[]>>
}

export interface SetLog {
  weightKg?: number
  reps?: number
  effort?: Effort
  completed: boolean
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetLog[]
  notes?: string
}

export interface CardioLog {
  exerciseId: string
  minutes?: number
  speedKph?: number
  inclinePercent?: number
  effort?: Effort
  completed: boolean
}

export interface WorkoutSession {
  id: string
  date: string
  workoutDefinitionId: WorkoutId
  mode: TrainingMode
  status: 'active' | 'completed'
  phase: 'working' | 'debrief'
  currentExerciseIndex: number
  startedAt: string
  completedAt?: string
  exercises: ExerciseLog[]
  cardio: CardioLog[]
  overallEffort?: Effort
  kneeStatus?: string
  breathingStatus?: string
  notes?: string
}

export interface BodyWeightEntry { id: string; date: string; weightKg: number }
export interface HydrationEntry { id: string; date: string; glasses: number }
export interface FoodDayCheckin {
  date: string
  breakfast?: boolean
  lunch?: boolean
  hungerBridge?: boolean
  dinner?: boolean
  postWorkoutProtein?: boolean
  notes?: string
}
export interface ReturnEvent { id: string; date: string; sessionId: string; daysSinceLastSession: number }

export interface AppData {
  profile: UserProfile
  preferredMode: 'GREEN' | 'AMBER' | 'RESET'
  nextWorkoutDefinitionId: WorkoutId
  activeWorkout: WorkoutSession | null
  sessions: WorkoutSession[]
  returnEvents: ReturnEvent[]
  bodyWeights: BodyWeightEntry[]
  hydration: HydrationEntry[]
  foodCheckins: FoodDayCheckin[]
}
