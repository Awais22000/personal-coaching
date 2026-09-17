import type { ExerciseEducation } from '../domain/models'

export function AnatomyDiagram({ education, compact = false }: { education: ExerciseEducation; compact?: boolean }) {
  return <div className={`anatomy-card ${compact ? 'anatomy-compact' : ''}`} role="img" aria-label={`${education.anatomyView} anatomy diagram. Primary muscles: ${education.primaryMuscles.join(', ')}. Secondary muscles: ${education.secondaryMuscles.join(', ')}.`}>
    <div className={`anatomy-art ${education.anatomyView}`}><img src="/anatomy/anatomy-muscular-figures.png" alt="" /></div>
    <div><span className="eyebrow">{education.anatomyView.toUpperCase()} VIEW</span><p><strong>Primary:</strong> {education.primaryMuscles.join(' · ')}</p><p><strong>Secondary:</strong> {education.secondaryMuscles.join(' · ') || 'None listed'}</p></div>
  </div>
}
