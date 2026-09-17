import { describe, expect, it } from 'vitest'
import { exercises, workouts, workoutPlan } from '../src/data/workouts'

describe('exercise education coverage', () => {
  it('provides structured education for every programmed exercise', () => {
    const ids = new Set(Object.values(workouts).flatMap(workout => [...workout.exercises, ...Object.values(workout.modeExerciseIds).flatMap(items => items ?? [])].map(item => typeof item === 'string' ? item : item.exerciseId)))
    for (const id of ids) {
      const education = exercises[id].education
      expect(education?.primaryMuscles.length).toBeGreaterThan(0)
      expect(education?.instructions.length).toBeGreaterThan(0)
      expect(education?.formCues.length).toBeGreaterThan(0)
      expect(education?.avoidList.length).toBeGreaterThan(0)
      expect(education?.tutorial.type).toBe('animation')
    }
  })

  it('covers the active plans including RESET variants', () => {
    expect(workoutPlan('strength-a', 'RESET').every(item => exercises[item.exerciseId].education)).toBe(true)
    expect(workoutPlan('strength-b', 'RESET').every(item => exercises[item.exerciseId].education)).toBe(true)
  })
})
