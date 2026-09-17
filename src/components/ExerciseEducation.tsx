import { useState } from 'react'
import { exercises } from '../data/workouts'
import { AnatomyDiagram } from './AnatomyDiagram'

export function ExerciseEducation({ exerciseId }: { exerciseId: string }) {
  const exercise = exercises[exerciseId]
  const education = exercise.education!
  const [tab, setTab] = useState<'overview' | 'how' | 'tutorial'>('overview')
  return <div className="exercise-detail"><div className="education-tabs" role="tablist" aria-label="Exercise education">{(['overview', 'how', 'tutorial'] as const).map(value => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? 'selected' : ''} onClick={() => setTab(value)}>{value === 'how' ? 'HOW TO' : value.toUpperCase()}</button>)}</div>
    {tab === 'overview' && <><AnatomyDiagram education={education}/><div className="why-card"><span className="eyebrow">💡 WHY THIS EXERCISE?</span><p>{education.why}</p></div><div className="benefit-grid"><div><strong>GOOD FOR</strong><span>{education.primaryMuscles[0]}</span><small>Builds controlled strength.</small></div><div><strong>JOINT FRIENDLY</strong><span>Stable movement</span><small>Use a comfortable range.</small></div></div><div className="avoid-card"><span className="eyebrow">⚠ AVOID</span><p>{education.avoidList.join(' ')}</p></div></>}
    {tab === 'how' && <div className="education-copy"><span className="eyebrow">HOW TO</span><ol>{education.instructions.map(item => <li key={item}>{item}</li>)}</ol><span className="eyebrow">FORM CUES</span><ul>{education.formCues.map(item => <li key={item}>✓ {item}</li>)}</ul><span className="eyebrow">AVOID</span><ul>{education.avoidList.map(item => <li key={item}>{item}</li>)}</ul></div>}
    {tab === 'tutorial' && <div className="tutorial-placeholder"><span className="eyebrow">TUTORIAL</span><strong>Demonstration coming soon.</strong><p>Approved local tutorial media can be added without changing this screen.</p></div>}
  </div>
}
