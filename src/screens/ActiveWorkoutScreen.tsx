import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Minus, Plus, Trash2 } from 'lucide-react'
import { exercises, workouts, workoutPlan } from '../data/workouts'
import type { AppData, CardioLog, Effort, SetLog, WorkoutExercise } from '../domain/models'
import { ExerciseEducation } from '../components/ExerciseEducation'
import { addSet, beginDebrief, completeCardio, completeSet, discardActive, getLatestExercisePerformance, incompleteRequiredExercises, isExerciseComplete, removeAddedSet, setCurrentExercise, updateCardio, updateSet } from '../services/appService'

type Dispatch = (edit: (data: AppData) => AppData) => void
const efforts: Effort[] = ['easy', 'good', 'hard']
const numeric = (value: string) => value === '' ? undefined : Number(value)

function EffortChoices({ value, onChange, label }: { value?: Effort; onChange: (value: Effort) => void; label: string }) {
  return <fieldset className="effort-field"><legend className="eyebrow">{label}</legend><div className="effort-options">{efforts.map(effort => <button type="button" key={effort} aria-pressed={value === effort} className={value === effort ? 'selected' : ''} onClick={() => onChange(effort)}>{effort.toUpperCase()}</button>)}</div></fieldset>
}

function Stepper({ label, value, step, integer, onChange, suffix }: { label: string; value?: number; step: number; integer?: boolean; suffix?: string; onChange: (value?: number) => void }) {
  const change = (amount: number) => onChange(Math.max(0, Math.round(((value ?? 0) + amount) * 10) / 10))
  return <div className="stepper"><label className="eyebrow">{label}</label><div className="stepper-row"><button type="button" aria-label={`Decrease ${label.toLowerCase()}`} onClick={() => change(-step)}><Minus size={19}/></button><div className="stepper-input"><input aria-label={label} type="number" inputMode={integer ? 'numeric' : 'decimal'} min="0" step={step} value={value ?? ''} placeholder="—" onChange={event => onChange(numeric(event.target.value))}/>{suffix && <span>{suffix}</span>}</div><button type="button" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => change(step)}><Plus size={19}/></button></div></div>
}

function StrengthLogger({ data, item, dispatch }: { data: AppData; item: WorkoutExercise; dispatch: Dispatch }) {
  const session = data.activeWorkout!
  const log = session.exercises.find(entry => entry.exerciseId === item.exerciseId)!
  const [selected, setSelected] = useState(() => Math.max(0, log.sets.findIndex(set => !set.completed)))
  const setIndex = Math.min(selected, log.sets.length - 1)
  const current = log.sets[setIndex]
  const previous = getLatestExercisePerformance(data.sessions, item.exerciseId)
  const edit = (patch: Partial<SetLog>) => dispatch(data => updateSet(data, item.exerciseId, setIndex, patch))
  const complete = () => dispatch(data => completeSet(data, item.exerciseId, setIndex))
  const chooseEffort = (effort: Effort) => {
    edit({ effort })
    const next = log.sets.findIndex((set, index) => index > setIndex && !set.completed)
    if (next >= 0) setSelected(next)
  }
  return <div className="logger-panel">
    <div className="target-line"><span className="eyebrow">TODAY'S TARGET</span><strong>{item.sets} × {item.repGuidance}</strong><small>Choose a comfortable load. Several good reps should remain.</small></div>
    {previous ? <div className="last-performance"><span className="eyebrow">LAST COMPLETED</span><div>{previous.sets.map((set, index) => <span key={index}>{set.weightKg ?? 0} kg × {set.reps ?? 0}</span>)}</div></div> : <div className="first-exposure"><span className="eyebrow">FIRST EXPOSURE</span><p>Choose a comfortable starting load.</p></div>}
    <div className="set-tabs" role="group" aria-label="Sets">{log.sets.map((set, index) => <button key={index} type="button" className={index === setIndex ? 'selected' : ''} aria-pressed={index === setIndex} onClick={() => setSelected(index)}>SET {index + 1} {set.completed && <Check size={14} aria-label="completed"/>}</button>)}</div>
    <div className="set-label"><span className="eyebrow">SET {setIndex + 1} OF {log.sets.length}</span><span>{current.completed ? 'RECORDED · TAP VALUES TO EDIT' : 'READY TO LOG'}</span></div>
    <div className="number-grid"><Stepper label="Weight" value={current.weightKg} step={0.5} suffix="kg" onChange={value => edit({ weightKg: value })}/><Stepper label="Reps" value={current.reps} step={1} integer onChange={value => edit({ reps: value })}/></div>
    {!current.completed ? <button className="primary-button complete-set" type="button" disabled={current.weightKg === undefined || current.reps === undefined} onClick={complete}>COMPLETE SET <Check size={19}/></button> : <div className="recorded-note"><Check size={17}/> Set recorded. Values and effort can still be changed.</div>}
    {current.completed && <EffortChoices label="HOW DID IT FEEL?" value={current.effort} onChange={chooseEffort}/>}
    <div className="set-actions"><button type="button" className="text-button" onClick={() => { dispatch(data => addSet(data, item.exerciseId)); setSelected(log.sets.length) }}><Plus size={16}/> ADD SET</button>{setIndex >= (item.sets ?? 2) && <button type="button" className="text-button quiet-danger" onClick={() => { dispatch(data => removeAddedSet(data, item.exerciseId, setIndex)); setSelected(Math.max(0, setIndex - 1)) }}><Trash2 size={15}/> REMOVE ADDED SET</button>}</div>
  </div>
}

function CardioLogger({ data, item, dispatch }: { data: AppData; item: WorkoutExercise; dispatch: Dispatch }) {
  const log = data.activeWorkout!.cardio.find(entry => entry.exerciseId === item.exerciseId)!
  const fields = exercises[item.exerciseId].cardioFields ?? ['duration']
  const edit = (patch: Partial<CardioLog>) => dispatch(data => updateCardio(data, item.exerciseId, patch))
  return <div className="logger-panel"><div className="target-line"><span className="eyebrow">EASY MOVEMENT</span><strong>{item.repGuidance}</strong><small>Comfortable pace. This is not a speed test.</small></div>
    <div className="cardio-fields">
      {fields.includes('duration') && <Stepper label="Duration" value={log.minutes} step={1} suffix="min" onChange={value => edit({ minutes: value })}/>}
      {fields.includes('speed') && <label className="simple-field"><span className="eyebrow">SPEED · OPTIONAL</span><span className="simple-input"><input aria-label="Speed in kilometres per hour" type="number" inputMode="decimal" min="0" step="0.1" value={log.speedKph ?? ''} placeholder="—" onChange={event => edit({ speedKph: numeric(event.target.value) })}/> km/h</span></label>}
      {fields.includes('incline') && <label className="simple-field"><span className="eyebrow">INCLINE · OPTIONAL</span><span className="simple-input"><input aria-label="Incline percent" type="number" inputMode="decimal" min="0" step="0.1" value={log.inclinePercent ?? ''} placeholder="—" onChange={event => edit({ inclinePercent: numeric(event.target.value) })}/> %</span></label>}
    </div>
    <EffortChoices label="HOW DID IT FEEL?" value={log.effort} onChange={effort => edit({ effort })}/>
    <button className="primary-button complete-set" type="button" disabled={log.minutes === undefined || !log.effort} onClick={() => dispatch(data => completeCardio(data, item.exerciseId))}>{log.completed ? 'CARDIO RECORDED' : 'RECORD CARDIO'} <Check size={19}/></button>
    {log.completed && <div className="recorded-note"><Check size={17}/> Entry saved. You can adjust it above.</div>}
  </div>
}

export function ActiveWorkoutScreen({ data, dispatch }: { data: AppData; dispatch: Dispatch }) {
  const session = data.activeWorkout!
  const workout = workouts[session.workoutDefinitionId]
  const plan = workoutPlan(session.workoutDefinitionId, session.mode)
  const index = session.currentExerciseIndex
  const item = plan[index]
  const exercise = exercises[item.exerciseId]
  const [now, setNow] = useState(() => Date.now())
  const [confirm, setConfirm] = useState<'finish' | 'discard' | null>(null)
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  const seconds = Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000))
  const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  const incomplete = incompleteRequiredExercises(session)
  const navigate = (next: number) => dispatch(data => setCurrentExercise(data, next))
  return <div className="screen-content active-workout">
    <div className="live-top"><div><span className="eyebrow blue">ACTIVE WORKOUT</span><h1>{workout.title}</h1></div><span className="train-badge"><span className="status-dot"/>{session.mode}</span></div>
    <div className="live-stats"><span><Clock3 size={17}/>{elapsed} elapsed</span><span>Exercise {index + 1} of {plan.length}</span></div>
    <div className="exercise-rail" aria-label="Workout exercises">{plan.map((entry, position) => <button type="button" key={entry.exerciseId} aria-current={position === index ? 'step' : undefined} className={position === index ? 'selected' : ''} onClick={() => navigate(position)}><span>{isExerciseComplete(session, entry.exerciseId) ? <Check size={14} aria-label="completed"/> : String(position + 1).padStart(2, '0')}</span>{exercises[entry.exerciseId].name}</button>)}</div>
    <section className="live-exercise"><div className="live-exercise-title"><span className="eyebrow">{String(index + 1).padStart(2, '0')} / {String(plan.length).padStart(2, '0')} · {exercise.category === 'strength' ? 'STRENGTH' : 'CARDIO'}</span><h2>{exercise.name}</h2>{item.optional && <span className="soft-label">OPTIONAL</span>}</div>
      {exercise.category === 'strength' ? <StrengthLogger key={item.exerciseId} data={data} item={item} dispatch={dispatch}/> : <CardioLogger key={item.exerciseId} data={data} item={item} dispatch={dispatch}/>}
      <details className="guidance"><summary>Movement guidance <ChevronDown size={17}/></summary><ExerciseEducation exerciseId={item.exerciseId}/></details>
    </section>
    <div className="exercise-navigation"><button type="button" disabled={index === 0} onClick={() => navigate(index - 1)}><ArrowLeft size={17}/> PREVIOUS</button><button type="button" disabled={index === plan.length - 1} onClick={() => navigate(index + 1)}>NEXT <ArrowRight size={17}/></button></div>
    <div className="session-actions"><button type="button" className="primary-button" onClick={() => setConfirm('finish')}>COMPLETE WORKOUT <ArrowRight size={18}/></button><button type="button" className="text-button quiet-danger" onClick={() => setConfirm('discard')}>DISCARD ACTIVE SESSION</button></div>
    {confirm && <div className="dialog-backdrop"><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span className="eyebrow">{confirm === 'finish' ? 'SESSION CHECK' : 'ACTIVE SESSION'}</span><h2 id="confirm-title">{confirm === 'finish' ? 'Finish this session?' : 'Discard this unfinished session?'}</h2><p>{confirm === 'finish' ? incomplete > 0 ? 'Some exercises are not complete. Finish anyway?' : 'Ready to move to your session debrief?' : 'Completed workout history will not be affected.'}</p><div className="dialog-actions"><button type="button" onClick={() => setConfirm(null)}>{confirm === 'finish' ? 'KEEP TRAINING' : 'KEEP SESSION'}</button><button type="button" className="dialog-primary" onClick={() => { dispatch(data => confirm === 'finish' ? beginDebrief(data) : discardActive(data)); setConfirm(null) }}>{confirm === 'finish' ? 'FINISH SESSION' : 'DISCARD'}</button></div></div></div>}
  </div>
}
