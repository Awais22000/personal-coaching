import { ChevronDown } from 'lucide-react'
import type { WorkoutExercise } from '../domain/models'
import { exercises } from '../data/workouts'
import { ExerciseEducation } from './ExerciseEducation'

export function ExerciseCard({ item, index }: { item: WorkoutExercise; index: number }) {
  const exercise = exercises[item.exerciseId]
  return <details className="exercise-card">
    <summary>
      <span className="exercise-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="exercise-heading"><strong>{exercise.name}</strong><small>{item.sets ? `${item.sets} × ${item.repGuidance}` : item.repGuidance}{item.optional ? ' · optional' : ''}</small></span>
      <span className="effort-tag">{exercise.category === 'strength' ? 'RPE 5–6' : 'EASY'}</span>
      <ChevronDown size={18} className="chevron" aria-hidden="true" />
    </summary>
    <ExerciseEducation exerciseId={item.exerciseId}/>
  </details>
}
