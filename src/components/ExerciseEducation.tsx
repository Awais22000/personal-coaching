import { Image as ImageIcon } from 'lucide-react'
import { exercises } from '../data/workouts'

export function ExerciseEducation({ exerciseId }: { exerciseId: string }) {
  const exercise = exercises[exerciseId]
  return <div className="exercise-detail">
    <div className="image-placeholder"><ImageIcon size={22} strokeWidth={1.4} /><span>Illustration reserved</span></div>
    <div className="detail-grid">
      <div><span className="eyebrow">WHY</span><p>{exercise.why}</p></div>
      <div><span className="eyebrow">HOW</span><p>{exercise.how}</p></div>
      <div><span className="eyebrow">MUSCLES</span><p>{exercise.muscles.join(' · ')}</p></div>
      <div><span className="eyebrow">AVOID</span><p>{exercise.avoid}</p></div>
    </div>
  </div>
}
