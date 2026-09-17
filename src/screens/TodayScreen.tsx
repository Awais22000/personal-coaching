import { useState } from 'react'
import { ArrowRight, Check, Clock3, Droplets, Footprints, RotateCcw, Scale, ShieldCheck } from 'lucide-react'
import type { AppData, TrainingMode, WorkoutId } from '../domain/models'
import { workouts } from '../data/workouts'
import { addWeightEntry, getLatestWeight, sessionsThisWeek } from '../services/appService'
import { ModeSelector, type SelectableMode } from '../components/ModeSelector'

interface Props { data: AppData; nextId: WorkoutId; onMode: (mode: SelectableMode) => void; onStart: () => void; onTrain: () => void; onData: (edit: (data: AppData) => AppData) => void }

export function TodayScreen({ data, nextId, onMode, onStart, onTrain, onData }: Props) {
  const [weightOpen, setWeightOpen] = useState(false)
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const latest = getLatestWeight(data)
  const [today, setToday] = useState(() => new Date().toLocaleDateString('en-CA'))
  const workout = workouts[data.activeWorkout?.workoutDefinitionId ?? nextId]
  const mode: TrainingMode = data.activeWorkout?.mode ?? data.preferredMode
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const waterToday = data.hydration.filter(x => x.date === new Date().toLocaleDateString('en-CA')).reduce((sum, x) => sum + x.glasses, 0)
  const completedToday = [...data.sessions].reverse().find(session => session.completedAt && new Date(session.completedAt).toDateString() === new Date().toDateString())
  return <div className="screen-content">
    <div className="page-intro"><div><p className="eyebrow blue">OPERATING MODE · KEEP MOVING</p><h1>Today</h1><p className="muted date-line">{date}</p></div><div className="status-pill"><span className="status-dot" /> ACTIVE · {data.profile.runningStage}</div></div>

    <section className="mission-card">
      <div className="mission-top"><span className="eyebrow">TONIGHT'S MISSION</span><span className="mission-number">{workout.id === 'strength-a' ? '01' : '02'} / 02</span></div>
      <div className="mission-icon"><ShieldCheck size={23} strokeWidth={1.5} /></div>
      <h2>{data.activeWorkout ? 'Session in progress' : workout.title}</h2>
      <p className="mission-subtitle">{data.activeWorkout ? workouts[data.activeWorkout.workoutDefinitionId].title : workout.subtitle}</p>
      <div className="mission-meta"><span><Clock3 size={16}/>{workout.estimatedMinutes[mode === 'RECOVERY' ? 'RESET' : mode]} min</span><span className="meta-separator" /><span className="mode-chip">{mode}</span><span className="meta-separator" /><span>Full body</span></div>
      <button className="primary-button" onClick={data.activeWorkout ? onTrain : onStart}>{data.activeWorkout ? 'RESUME WORKOUT' : 'START WORKOUT'}<ArrowRight size={19}/></button>
      {!data.activeWorkout && <ModeSelector value={data.preferredMode} onChange={onMode}/>}
    </section>

    {completedToday && <div className="today-complete"><Check size={18}/><span>Mission saved today: {workouts[completedToday.workoutDefinitionId].title}{completedToday.mode === 'RESET' ? ' · RESET' : ''}. The next session waits for you.</span></div>}

    <section className="section-block"><div className="section-title"><div><span className="eyebrow">YOUR READOUT</span><h3>Current signals</h3></div><span className="soft-label">NO PRESSURE</span></div>
      <div className="telemetry-grid">
        <div className="telemetry telemetry-weight"><Scale size={20}/><span>WEIGHT</span><strong>{latest?.weightKg ?? data.profile.baselineWeightKg} <small>kg</small></strong><p>{latest ? `Latest weigh-in · ${latest.date === today ? 'Today' : latest.date}` : 'Profile baseline'}</p><button type="button" className="text-button" onClick={() => setWeightOpen(true)}>+ LOG WEIGHT</button></div>
        <div className="telemetry"><RotateCcw size={20}/><span>TRAINING</span><strong>{sessionsThisWeek(data.sessions)} <small>{sessionsThisWeek(data.sessions) === 1 ? 'session' : 'sessions'}</small></strong><p>This week</p></div>
        <div className="telemetry"><Droplets size={20}/><span>WATER</span><strong>{waterToday} <small>glasses</small></strong><p>Today</p></div>
        <div className="telemetry"><Footprints size={20}/><span>RUNNING</span><strong className="stage-value">{data.profile.runningStage}</strong><p>Build the base</p></div>
      </div>
    </section>

    <section className="signal-card"><div className="signal-mark">“</div><div><span className="eyebrow blue">MENTAL SIGNAL</span><p>Start smaller than your resistance.</p><small>No streak required. We count returns. We do not punish gaps.</small></div></section>
    {weightOpen && <div className="dialog-backdrop"><div className="confirm-dialog weight-dialog" role="dialog" aria-modal="true" aria-labelledby="weight-title"><span className="eyebrow">WEIGHT</span><h2 id="weight-title">LOG WEIGHT</h2><label className="simple-field"><span className="eyebrow">WEIGHT (KG)</span><span className="simple-input"><input autoFocus type="number" min="1" max="500" step="0.1" value={weight} onChange={event => setWeight(event.target.value)} placeholder={String(data.profile.baselineWeightKg)}/> kg</span></label><label className="simple-field"><span className="eyebrow">DATE</span><span className="simple-input"><input type="date" value={today} onChange={event => setToday(event.target.value)}/></span></label><label className="notes-field"><span className="eyebrow">OPTIONAL NOTE</span><textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Anything useful to remember?" /></label><div className="dialog-actions"><button type="button" onClick={() => setWeightOpen(false)}>CANCEL</button><button type="button" className="dialog-primary" disabled={!weight || Number(weight) <= 0 || !today} onClick={() => { onData(current => addWeightEntry(current, Number(weight), today, note || undefined)); setWeightOpen(false); setWeight(''); setNote('') }}>SAVE WEIGHT</button></div></div></div>}
  </div>
}
