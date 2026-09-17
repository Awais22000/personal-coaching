import type { ExerciseEducation } from '../domain/models'

export function AnatomyDiagram({ education, compact = false }: { education: ExerciseEducation; compact?: boolean }) {
  return <div className={`anatomy-card ${compact ? 'anatomy-compact' : ''}`} role="img" aria-label={`${education.anatomyView} anatomy diagram. Primary muscles: ${education.primaryMuscles.join(', ')}. Secondary muscles: ${education.secondaryMuscles.join(', ')}.`}>
    <svg viewBox="0 0 180 250" aria-hidden="true"><circle cx="90" cy="27" r="18" className="anatomy-line"/><path d="M65 55 Q90 45 115 55 L125 115 108 145 103 222 M77 145 72 222 M65 58 42 112 55 119 75 92 M115 58 138 112 125 119 105 92" className="anatomy-line"/><path d={education.anatomyView === 'back' ? 'M72 72 Q90 63 108 72 L104 116 Q90 128 76 116Z' : 'M74 70 Q90 60 106 70 L103 111 Q90 122 77 111Z'} className="anatomy-primary"/><path d="M55 119 Q70 130 76 145 L66 178 53 174 60 140Z M125 119 Q110 130 104 145 L114 178 127 174 120 140Z" className="anatomy-secondary"/><path d="M76 145 88 145 84 205 72 205Z M104 145 92 145 96 205 108 205Z" className="anatomy-secondary"/></svg>
    <div><span className="eyebrow">{education.anatomyView.toUpperCase()} VIEW</span><p><strong>Primary:</strong> {education.primaryMuscles.join(' · ')}</p><p><strong>Secondary:</strong> {education.secondaryMuscles.join(' · ') || 'None listed'}</p></div>
  </div>
}
