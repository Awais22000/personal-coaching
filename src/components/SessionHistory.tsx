import { ArrowLeft, ArrowRight, Check, Clock3 } from 'lucide-react'
import { exercises, workouts, workoutPlan } from '../data/workouts'
import type { WorkoutSession } from '../domain/models'
import { sessionSummary } from '../services/appService'

function dateLabel(date: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date)) }

export function SessionHistory({ sessions, onOpen }: { sessions: WorkoutSession[]; onOpen: (id: string) => void }) {
  const recent = sessions.map((session, index) => ({ session, index })).filter(({ session }) => session.completedAt)
    .sort((a, b) => b.session.completedAt!.localeCompare(a.session.completedAt!) || b.index - a.index).slice(0, 8).map(({ session }) => session)
  return <section className="section-block"><div className="section-title"><div><span className="eyebrow">THE WORK DONE</span><h3>Recent sessions</h3></div></div>
    {recent.length === 0 ? <div className="empty-state">No completed sessions yet.<br/><span>Your first saved mission will appear here.</span></div> : <div className="history-list">{recent.map(session => { const summary = sessionSummary(session, new Date(session.completedAt!)); return <button type="button" className="history-item" key={session.id} onClick={() => onOpen(session.id)}><div><span className="eyebrow">{dateLabel(session.completedAt!)}</span><strong>{workouts[session.workoutDefinitionId].title}{session.mode === 'RESET' ? ' · Return' : ''}</strong><small>{session.mode} · {summary.minutes} min · {summary.exercises} exercises</small></div><ArrowRight size={17}/></button> })}</div>}
  </section>
}

export function SessionDetail({ session, onBack }: { session: WorkoutSession; onBack: () => void }) {
  const summary = sessionSummary(session, new Date(session.completedAt ?? session.startedAt))
  return <div className="screen-content"><button type="button" className="back-button" onClick={onBack}><ArrowLeft size={17}/> BACK TO TRAIN</button><div className="page-intro"><div><p className="eyebrow blue">SAVED SESSION · {dateLabel(session.completedAt ?? session.startedAt)}</p><h1>{workouts[session.workoutDefinitionId].title}</h1><p className="muted">{session.mode} · {summary.minutes} min · {summary.workingSets} working sets</p></div></div>
    <div className="history-detail-list">{workoutPlan(session.workoutDefinitionId, session.mode).map((item, index) => { const strength = session.exercises.find(log => log.exerciseId === item.exerciseId); const cardio = session.cardio.find(log => log.exerciseId === item.exerciseId); const logged = strength?.sets.filter(set => set.completed) ?? []; return <div className="history-detail-item" key={item.exerciseId}><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><div><h3>{exercises[item.exerciseId].name}</h3>{logged.length > 0 ? logged.map((set, setIndex) => <p key={setIndex}><Check size={14}/> Set {setIndex + 1}: {set.weightKg ?? 0} kg × {set.reps ?? 0}{set.effort ? ` · ${set.effort.toUpperCase()}` : ''}</p>) : cardio?.completed ? <p><Clock3 size={14}/>{cardio.minutes} min{cardio.speedKph !== undefined ? ` · ${cardio.speedKph} km/h` : ''}{cardio.inclinePercent !== undefined ? ` · ${cardio.inclinePercent}% incline` : ''}{cardio.effort ? ` · ${cardio.effort.toUpperCase()}` : ''}</p> : <p className="muted">Not logged</p>}</div></div> })}</div>
    <div className="detail-debrief"><span className="eyebrow">SESSION DEBRIEF</span><p>Overall: {session.overallEffort?.toUpperCase() ?? '—'} · Knees: {session.kneeStatus ?? '—'} · Breathing: {session.breathingStatus ?? '—'}</p>{session.notes && <p>{session.notes}</p>}</div>
  </div>
}
