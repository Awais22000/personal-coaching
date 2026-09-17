import { exercises, workouts, workoutPlan } from '../data/workouts'
import type { AppData, BodyWeightEntry, CardioLog, Effort, ExerciseLog, SetLog, TrainingMode, WorkoutId, WorkoutSession } from '../domain/models'
import { localStorageAdapter } from '../storage/localStorageAdapter'
import type { StorageAdapter } from '../storage/storageAdapter'

const KEY = 'awais-reset-r0'
const SCHEMA_VERSION = 2
type Envelope = { version: number; data: unknown }
type LegacyActive = { id: string; workoutDefinitionId: WorkoutId; mode: TrainingMode; startedAt: string }

export const initialData = (): AppData => ({
  profile: { id: 'awais', displayName: 'Awais', baselineWeightKg: 125, directionWeightKg: 100, runningStage: 'BASE', createdAt: new Date().toISOString() },
  preferredMode: 'GREEN', nextWorkoutDefinitionId: 'strength-a', activeWorkout: null,
  sessions: [], returnEvents: [], bodyWeights: [], hydration: [], foodCheckins: [],
})

function latestCompleted(sessions: WorkoutSession[], predicate: (session: WorkoutSession) => boolean = () => true): WorkoutSession | undefined {
  return sessions.map((session, index) => ({ session, index }))
    .filter(({ session }) => session.completedAt && predicate(session))
    .sort((a, b) => b.session.completedAt!.localeCompare(a.session.completedAt!) || b.index - a.index)[0]?.session
}

export function nextWorkoutId(sessions: WorkoutSession[]): WorkoutId {
  const last = latestCompleted(sessions, session => session.status === 'completed' && session.mode !== 'RESET' && session.mode !== 'RECOVERY')
  return last?.workoutDefinitionId === 'strength-a' ? 'strength-b' : 'strength-a'
}

function validBase(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const value = data as Record<string, unknown>
  return Boolean(value.profile && Array.isArray(value.sessions) && Array.isArray(value.returnEvents) &&
    Array.isArray(value.bodyWeights) && Array.isArray(value.hydration) && Array.isArray(value.foodCheckins))
}

function validV2(data: unknown): data is AppData {
  if (!validBase(data)) return false
  return (data.nextWorkoutDefinitionId === 'strength-a' || data.nextWorkoutDefinitionId === 'strength-b') &&
    (data.preferredMode === 'GREEN' || data.preferredMode === 'AMBER' || data.preferredMode === 'RESET') &&
    (data.activeWorkout === null || Boolean(data.activeWorkout && typeof data.activeWorkout === 'object' &&
      (data.activeWorkout as WorkoutSession).status === 'active' && Array.isArray((data.activeWorkout as WorkoutSession).exercises)))
}

function migrateV1(data: unknown): AppData {
  if (!validBase(data)) return initialData()
  const old = data as unknown as AppData & { activeWorkout: LegacyActive | null }
  const sessions = old.sessions.filter(session => session.completedAt).map(session => ({
    ...session, status: 'completed' as const, phase: 'working' as const, currentExerciseIndex: 0,
    cardio: (session.cardio ?? []).map(cardio => ({ ...cardio, effort: cardio.effort ?? (cardio as CardioLog & { perceivedEffort?: Effort }).perceivedEffort, completed: true })),
  }))
  const activeWorkout = old.activeWorkout && workouts[old.activeWorkout.workoutDefinitionId]
    ? createSession(old.activeWorkout.workoutDefinitionId, old.activeWorkout.mode, sessions, old.activeWorkout.id, old.activeWorkout.startedAt)
    : null
  return {
    profile: old.profile, preferredMode: old.preferredMode === 'AMBER' ? 'AMBER' : 'GREEN',
    nextWorkoutDefinitionId: nextWorkoutId(sessions), activeWorkout, sessions,
    returnEvents: old.returnEvents, bodyWeights: old.bodyWeights, hydration: old.hydration, foodCheckins: old.foodCheckins,
  }
}

export function loadAppData(adapter: StorageAdapter = localStorageAdapter): AppData {
  const envelope = adapter.read<Envelope>(KEY)
  if (!envelope) return initialData()
  if (envelope.version === SCHEMA_VERSION && validV2(envelope.data)) return { ...envelope.data, nextWorkoutDefinitionId: nextWorkoutId(envelope.data.sessions) }
  if (envelope.version === 1) return migrateV1(envelope.data)
  return initialData()
}

export function saveAppData(data: AppData, adapter: StorageAdapter = localStorageAdapter) {
  adapter.write<Envelope>(KEY, { version: SCHEMA_VERSION, data })
}

export function getLatestExercisePerformance(sessions: WorkoutSession[], exerciseId: string): ExerciseLog | null {
  const session = latestCompleted(sessions, item => item.status === 'completed' &&
    item.exercises.some(log => log.exerciseId === exerciseId && log.sets.some(set => set.completed)))
  const log = session?.exercises.find(item => item.exerciseId === exerciseId)
  return log ? { ...log, sets: log.sets.filter(set => set.completed) } : null
}

function createSession(workoutDefinitionId: WorkoutId, mode: TrainingMode, history: WorkoutSession[], id: string = crypto.randomUUID(), startedAt = new Date().toISOString()): WorkoutSession {
  const plan = workoutPlan(workoutDefinitionId, mode)
  return {
    id, date: startedAt.slice(0, 10), workoutDefinitionId, mode, status: 'active', phase: 'working', currentExerciseIndex: 0,
    startedAt, exercises: plan.filter(item => exercises[item.exerciseId].category === 'strength').map(item => {
      const previous = getLatestExercisePerformance(history, item.exerciseId)?.sets ?? []
      const targetReps = Number.parseInt(item.repGuidance, 10) || undefined
      return { exerciseId: item.exerciseId, sets: Array.from({ length: item.sets ?? 2 }, (_, index) => {
        const last = previous[index] ?? previous.at(-1)
        return { weightKg: last?.weightKg, reps: last?.reps ?? targetReps, completed: false }
      }) }
    }),
    cardio: plan.filter(item => exercises[item.exerciseId].category !== 'strength').map(item => ({ exerciseId: item.exerciseId, completed: false })),
  }
}

export function startWorkout(data: AppData, mode: TrainingMode = data.preferredMode): AppData {
  if (data.activeWorkout) return data
  return { ...data, activeWorkout: createSession(nextWorkoutId(data.sessions), mode, data.sessions) }
}

export function discardActive(data: AppData): AppData { return { ...data, activeWorkout: null } }

function updateActive(data: AppData, edit: (session: WorkoutSession) => WorkoutSession): AppData {
  return data.activeWorkout ? { ...data, activeWorkout: edit(data.activeWorkout) } : data
}

export function setCurrentExercise(data: AppData, index: number): AppData {
  return updateActive(data, session => ({ ...session, currentExerciseIndex: Math.max(0, Math.min(workoutPlan(session.workoutDefinitionId, session.mode).length - 1, index)) }))
}

function editExercise(data: AppData, exerciseId: string, edit: (log: ExerciseLog) => ExerciseLog): AppData {
  return updateActive(data, session => ({ ...session, exercises: session.exercises.map(log => log.exerciseId === exerciseId ? edit(log) : log) }))
}

export function updateSet(data: AppData, exerciseId: string, setIndex: number, patch: Partial<SetLog>): AppData {
  const safe: Partial<SetLog> = { ...patch }
  if (safe.weightKg !== undefined) safe.weightKg = Math.max(0, Math.round(safe.weightKg * 10) / 10)
  if (safe.reps !== undefined) safe.reps = Math.max(0, Math.floor(safe.reps))
  return editExercise(data, exerciseId, log => ({ ...log, sets: log.sets.map((set, index) => index === setIndex ? { ...set, ...safe } : set) }))
}

export function completeSet(data: AppData, exerciseId: string, setIndex: number): AppData {
  return editExercise(data, exerciseId, log => {
    const recorded = log.sets[setIndex]
    if (!recorded || recorded.weightKg === undefined || recorded.reps === undefined) return log
    return { ...log, sets: log.sets.map((set, index) => {
      if (index === setIndex) return { ...set, completed: true }
      if (index === setIndex + 1 && !set.completed) return { ...set, weightKg: set.weightKg ?? recorded.weightKg, reps: set.reps ?? recorded.reps }
      return set
    }) }
  })
}

export function addSet(data: AppData, exerciseId: string): AppData {
  return editExercise(data, exerciseId, log => ({ ...log, sets: [...log.sets, { weightKg: log.sets.at(-1)?.weightKg, reps: log.sets.at(-1)?.reps, completed: false }] }))
}

export function removeAddedSet(data: AppData, exerciseId: string, setIndex: number): AppData {
  const prescription = workouts[data.activeWorkout?.workoutDefinitionId ?? data.nextWorkoutDefinitionId].exercises.find(item => item.exerciseId === exerciseId)?.sets ?? 2
  return setIndex < prescription ? data : editExercise(data, exerciseId, log => ({ ...log, sets: log.sets.filter((_, index) => index !== setIndex) }))
}

export function updateCardio(data: AppData, exerciseId: string, patch: Partial<CardioLog>): AppData {
  const safe = { ...patch }
  for (const field of ['minutes', 'speedKph', 'inclinePercent'] as const) {
    if (safe[field] !== undefined) safe[field] = Math.max(0, Math.round(safe[field] * 10) / 10)
  }
  return updateActive(data, session => ({ ...session, cardio: session.cardio.map(log => log.exerciseId === exerciseId ? { ...log, ...safe } : log) }))
}

export function completeCardio(data: AppData, exerciseId: string): AppData {
  return updateActive(data, session => ({ ...session, cardio: session.cardio.map(log => log.exerciseId === exerciseId && log.minutes !== undefined ? { ...log, completed: true } : log) }))
}

export function isExerciseComplete(session: WorkoutSession, exerciseId: string): boolean {
  const exercise = exercises[exerciseId]
  if (exercise.category !== 'strength') return Boolean(session.cardio.find(log => log.exerciseId === exerciseId)?.completed)
  const sets = session.exercises.find(log => log.exerciseId === exerciseId)?.sets ?? []
  return sets.length > 0 && sets.every(set => set.completed)
}

export function incompleteRequiredExercises(session: WorkoutSession): number {
  return workoutPlan(session.workoutDefinitionId, session.mode).filter(item => !item.optional && !isExerciseComplete(session, item.exerciseId)).length
}

export function beginDebrief(data: AppData): AppData { return updateActive(data, session => ({ ...session, phase: 'debrief' })) }
export function resumeWorking(data: AppData): AppData { return updateActive(data, session => ({ ...session, phase: 'working' })) }
export function updateDebrief(data: AppData, patch: Partial<Pick<WorkoutSession, 'overallEffort' | 'kneeStatus' | 'breathingStatus' | 'notes'>>): AppData {
  return updateActive(data, session => ({ ...session, ...patch }))
}

export function sessionSummary(session: WorkoutSession, at = new Date()): { minutes: number; exercises: number; totalExercises: number; workingSets: number } {
  return {
    minutes: Math.max(0, Math.round((at.getTime() - new Date(session.startedAt).getTime()) / 60000)),
    exercises: workoutPlan(session.workoutDefinitionId, session.mode).filter(item => isExerciseComplete(session, item.exerciseId)).length,
    totalExercises: workoutPlan(session.workoutDefinitionId, session.mode).length,
    workingSets: session.exercises.reduce((total, log) => total + log.sets.filter(set => set.completed).length, 0),
  }
}

export function saveSession(data: AppData, completedAt = new Date().toISOString()): AppData {
  const active = data.activeWorkout
  if (!active || active.phase !== 'debrief') return data
  const completed: WorkoutSession = { ...active, status: 'completed', completedAt }
  const sessions = [...data.sessions, completed]
  const previous = latestCompleted(data.sessions)
  const daysSinceLastSession = previous ? Math.max(0, Math.floor((new Date(completedAt).getTime() - new Date(previous.completedAt!).getTime()) / 86400000)) : 0
  return {
    ...data, activeWorkout: null, preferredMode: 'GREEN', sessions,
    nextWorkoutDefinitionId: nextWorkoutId(sessions),
    returnEvents: active.mode === 'RESET' ? [...data.returnEvents, { id: crypto.randomUUID(), date: completedAt.slice(0, 10), sessionId: active.id, daysSinceLastSession }] : data.returnEvents,
  }
}

export function deleteCompletedSession(data: AppData, sessionId: string): AppData {
  if (!data.sessions.some(session => session.id === sessionId && session.status === 'completed' && session.completedAt)) return data
  const sessions = data.sessions.filter(session => session.id !== sessionId)
  return {
    ...data,
    sessions,
    returnEvents: data.returnEvents.filter(event => event.sessionId !== sessionId),
    nextWorkoutDefinitionId: nextWorkoutId(sessions),
  }
}

export function sessionsThisWeek(sessions: WorkoutSession[], now = new Date()): number {
  const start = new Date(now)
  const day = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return sessions.filter(session => session.completedAt && new Date(session.completedAt) >= start).length
}

export function getWeightEntries(data: AppData): BodyWeightEntry[] {
  return [...data.bodyWeights].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export function getLatestWeight(data: AppData): BodyWeightEntry | undefined { return getWeightEntries(data)[0] }

export function addWeightEntry(data: AppData, weightKg: number, date: string, note?: string): AppData {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return data
  return { ...data, bodyWeights: [...data.bodyWeights, { id: crypto.randomUUID(), date, weightKg: Math.round(weightKg * 10) / 10, createdAt: new Date().toISOString(), note }] }
}

export function deleteWeightEntry(data: AppData, id: string): AppData { return { ...data, bodyWeights: data.bodyWeights.filter(entry => entry.id !== id) } }
