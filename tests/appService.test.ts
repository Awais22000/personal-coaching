import { describe, expect, it } from 'vitest'
import type { AppData, WorkoutSession } from '../src/domain/models'
import type { StorageAdapter } from '../src/storage/storageAdapter'
import { addSet, beginDebrief, completeCardio, completeSet, discardActive, getLatestExercisePerformance, initialData, loadAppData, nextWorkoutId, removeAddedSet, saveAppData, saveSession, setCurrentExercise, startWorkout, updateCardio, updateSet } from '../src/services/appService'
import { workoutPlan } from '../src/data/workouts'

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>()
  read<T>(key: string): T | null { const value = this.values.get(key); return value ? JSON.parse(value) as T : null }
  write<T>(key: string, value: T): void { this.values.set(key, JSON.stringify(value)) }
  remove(key: string): void { this.values.delete(key) }
}

function finish(data: AppData): AppData { return saveSession(beginDebrief(data), '2026-09-17T21:50:00.000Z') }

describe('session sequence and storage', () => {
  it('starts a fresh user at A, then alternates A → B → A only on completed normal sessions', () => {
    let data = initialData()
    expect(data.nextWorkoutDefinitionId).toBe('strength-a')
    data = finish(startWorkout(data))
    expect(data.nextWorkoutDefinitionId).toBe('strength-b')
    data = finish(startWorkout(data))
    expect(data.nextWorkoutDefinitionId).toBe('strength-a')
    expect(nextWorkoutId(data.sessions)).toBe('strength-a')
  })

  it('does not advance after an active session is discarded or started twice', () => {
    const first = startWorkout(initialData())
    const again = startWorkout(first)
    expect(again.activeWorkout?.id).toBe(first.activeWorkout?.id)
    const discarded = discardActive(again)
    expect(discarded.activeWorkout).toBeNull()
    expect(discarded.nextWorkoutDefinitionId).toBe('strength-a')
    expect(discarded.sessions).toHaveLength(0)
  })

  it('keeps an active workout and a completed set through persistence reload', () => {
    const storage = new MemoryStorage()
    let data = startWorkout(initialData())
    data = updateSet(data, 'leg-press', 0, { weightKg: 50, reps: 10 })
    data = completeSet(data, 'leg-press', 0)
    data = updateSet(data, 'leg-press', 0, { effort: 'good' })
    data = setCurrentExercise(data, 2)
    saveAppData(data, storage)
    const reloaded = loadAppData(storage)
    expect(reloaded.activeWorkout?.id).toBe(data.activeWorkout?.id)
    expect(reloaded.activeWorkout?.currentExerciseIndex).toBe(2)
    expect(reloaded.activeWorkout?.exercises.find(log => log.exerciseId === 'leg-press')?.sets[0]).toEqual({ weightKg: 50, reps: 10, completed: true, effort: 'good' })
  })

  it('prefills the next draft set from the set just completed without marking it complete', () => {
    let data = startWorkout(initialData())
    data = updateSet(data, 'leg-press', 0, { weightKg: 50, reps: 10 })
    data = completeSet(data, 'leg-press', 0)
    expect(data.activeWorkout?.exercises.find(log => log.exerciseId === 'leg-press')?.sets[1]).toMatchObject({ weightKg: 50, reps: 10, completed: false })
  })

  it('keeps the next mission unchanged while a session is only active', () => {
    const data = startWorkout(initialData())
    expect(data.nextWorkoutDefinitionId).toBe('strength-a')
    expect(data.sessions).toHaveLength(0)
  })

  it('clamps negative weight and fractional reps before storing them', () => {
    let data = startWorkout(initialData())
    data = updateSet(data, 'leg-press', 0, { weightKg: -2, reps: 10.9 })
    expect(data.activeWorkout?.exercises.find(log => log.exerciseId === 'leg-press')?.sets[0]).toMatchObject({ weightKg: 0, reps: 10 })
  })

  it('reads previous performance only from the latest completed session', () => {
    let data = startWorkout(initialData())
    data = updateSet(data, 'leg-press', 0, { weightKg: 50, reps: 10 })
    data = completeSet(data, 'leg-press', 0)
    data = finish(data)
    const latest = getLatestExercisePerformance(data.sessions, 'leg-press')
    expect(latest?.sets[0]).toMatchObject({ weightKg: 50, reps: 10 })
    let active = startWorkout({ ...data, nextWorkoutDefinitionId: 'strength-a' })
    active = updateSet(active, 'leg-press', 0, { weightKg: 90, reps: 2 })
    active = completeSet(active, 'leg-press', 0)
    const incompleteInHistory = { ...active.activeWorkout!, status: 'active' as const, completedAt: undefined }
    expect(getLatestExercisePerformance([...data.sessions, incompleteInHistory], 'leg-press')?.sets[0].weightKg).toBe(50)
    expect(getLatestExercisePerformance(discardActive(active).sessions, 'leg-press')?.sets[0].weightKg).toBe(50)
  })

  it('keeps B due after a RESET return and records that return', () => {
    let data = finish(startWorkout(initialData()))
    expect(data.nextWorkoutDefinitionId).toBe('strength-b')
    data = finish(startWorkout(data, 'RESET'))
    expect(data.nextWorkoutDefinitionId).toBe('strength-b')
    expect(data.sessions.at(-1)?.mode).toBe('RESET')
    expect(data.returnEvents).toHaveLength(1)
  })

  it('uses shorter configured plans for AMBER and RESET', () => {
    expect(workoutPlan('strength-a', 'GREEN')).toHaveLength(8)
    expect(workoutPlan('strength-a', 'AMBER')).toHaveLength(6)
    expect(workoutPlan('strength-a', 'RESET')).toHaveLength(4)
    const reset = startWorkout(initialData(), 'RESET').activeWorkout!
    expect(reset.exercises.map(log => log.exerciseId)).toEqual(['leg-press', 'lat-pulldown'])
    expect(reset.cardio.map(log => log.exerciseId)).toEqual(['easy-cardio', 'easy-finish'])
  })

  it('migrates a version 1 preview and history into the version 2 shape', () => {
    const storage = new MemoryStorage()
    const base = initialData()
    const oldSession = { id: 'old', date: '2026-09-10', workoutDefinitionId: 'strength-a', mode: 'GREEN', startedAt: '2026-09-10T20:00:00.000Z', completedAt: '2026-09-10T20:40:00.000Z', exercises: [], cardio: [] } as WorkoutSession
    storage.write('awais-reset-r0', { version: 1, data: { ...base, sessions: [oldSession], activeWorkout: { id: 'preview', workoutDefinitionId: 'strength-b', mode: 'AMBER', startedAt: '2026-09-17T20:00:00.000Z' } } })
    const migrated = loadAppData(storage)
    expect(migrated.nextWorkoutDefinitionId).toBe('strength-b')
    expect(migrated.sessions[0].status).toBe('completed')
    expect(migrated.activeWorkout).toMatchObject({ id: 'preview', status: 'active', mode: 'AMBER' })
    expect(migrated.activeWorkout?.exercises.length).toBeGreaterThan(0)
  })

  it('saves cardio and permits only added sets to be removed', () => {
    let data = startWorkout(initialData())
    data = updateCardio(data, 'easy-cardio', { minutes: 5, speedKph: 4.5, inclinePercent: 1, effort: 'easy' })
    data = completeCardio(data, 'easy-cardio')
    data = addSet(data, 'leg-press')
    expect(data.activeWorkout?.exercises.find(log => log.exerciseId === 'leg-press')?.sets).toHaveLength(3)
    const protectedData = removeAddedSet(data, 'leg-press', 0)
    expect(protectedData.activeWorkout?.exercises.find(log => log.exerciseId === 'leg-press')?.sets).toHaveLength(3)
    data = removeAddedSet(data, 'leg-press', 2)
    expect(data.activeWorkout?.exercises.find(log => log.exerciseId === 'leg-press')?.sets).toHaveLength(2)
    const saved = finish(data)
    expect(saved.sessions[0].cardio[0]).toMatchObject({ minutes: 5, speedKph: 4.5, inclinePercent: 1, effort: 'easy', completed: true })
  })
})
