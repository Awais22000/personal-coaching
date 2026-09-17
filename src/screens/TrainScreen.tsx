import { ArrowRight, Clock3, Dumbbell } from 'lucide-react'
import type { AppData, WorkoutId } from '../domain/models'
import { workouts, workoutPlan } from '../data/workouts'
import { ExerciseCard } from '../components/ExerciseCard'
import { ModeSelector, type SelectableMode } from '../components/ModeSelector'
import { SessionHistory } from '../components/SessionHistory'

interface Props { data: AppData; nextId: WorkoutId; onMode: (mode: SelectableMode) => void; onStart: () => void; onOpenHistory: (id: string) => void }

export function TrainScreen({ data, nextId, onMode, onStart, onOpenHistory }: Props) {
  const workout = workouts[nextId]
  const mode = data.preferredMode
  const plan = workoutPlan(nextId, mode)
  return <div className="screen-content">
    <div className="page-intro"><div><p className="eyebrow blue">THE WORK WAITS FOR YOU</p><h1>Train</h1><p className="muted">One session at a time. No calendar debt.</p></div></div>
    <section className="train-hero">
      <div className="train-hero-head"><span className="eyebrow">NEXT MISSION</span><span className="train-badge"><span className="status-dot" /> {mode}</span></div>
      <div className="train-hero-body"><div className="train-illustration"><Dumbbell size={37} strokeWidth={1.25}/></div><div><h2>{workout.title}</h2><p>{workout.subtitle}</p></div></div>
      <div className="train-stats"><span><Clock3 size={16}/>{workout.estimatedMinutes[mode]} min</span><span><Dumbbell size={16}/>{plan.length} movements</span><span>RPE 5–6</span></div>
      <button className="primary-button" onClick={onStart}>START SESSION <ArrowRight size={19}/></button>
      <ModeSelector value={mode} onChange={onMode}/>
    </section>
    <section className="section-block exercise-section"><div className="section-title"><div><span className="eyebrow">SESSION MAP</span><h3>The movements</h3></div><span className="soft-label">TAP TO EXPAND</span></div>
      <p className="section-note">Light calibration work. Choose a load that leaves several good reps in reserve. Optional movements can be skipped.</p>
      <div className="exercise-list">{plan.map((item, index) => <ExerciseCard key={item.exerciseId} item={item} index={index}/>)}</div>
    </section>
    <SessionHistory sessions={data.sessions} onOpen={onOpenHistory}/>
  </div>
}
