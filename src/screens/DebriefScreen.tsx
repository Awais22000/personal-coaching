import { ArrowRight, Check } from 'lucide-react'
import type { AppData, Effort, WorkoutSession } from '../domain/models'
import { sessionSummary, updateDebrief } from '../services/appService'

type Dispatch = (edit: (data: AppData) => AppData) => void

function ChoiceGroup({ label, value, choices, onChange }: { label: string; value?: string; choices: string[]; onChange: (value: string) => void }) {
  return <fieldset className="debrief-group"><legend className="eyebrow">{label}</legend><div className="debrief-options">{choices.map(choice => <button type="button" key={choice} aria-pressed={value === choice} className={value === choice ? 'selected' : ''} onClick={() => onChange(choice)}>{choice.toUpperCase()}</button>)}</div></fieldset>
}

export function DebriefScreen({ data, dispatch, onSave }: { data: AppData; dispatch: Dispatch; onSave: () => void }) {
  const session = data.activeWorkout!
  const summary = sessionSummary(session)
  const edit = (patch: Partial<Pick<WorkoutSession, 'overallEffort' | 'kneeStatus' | 'breathingStatus' | 'notes'>>) => dispatch(data => updateDebrief(data, patch))
  return <div className="screen-content debrief-screen"><p className="eyebrow blue">SESSION DEBRIEF</p><h1>Mission complete.</h1><p className="muted">A little context helps the next session stay grounded.</p>
    <div className="debrief-stats"><div><strong>{summary.minutes}</strong><span>MINUTES</span></div><div><strong>{summary.exercises} / {summary.totalExercises}</strong><span>EXERCISES</span></div><div><strong>{summary.workingSets}</strong><span>WORKING SETS</span></div></div>
    <div className="debrief-form"><ChoiceGroup label="OVERALL EFFORT" value={session.overallEffort} choices={['easy', 'good', 'hard']} onChange={value => edit({ overallEffort: value as Effort })}/><ChoiceGroup label="KNEES" value={session.kneeStatus} choices={['Fine', 'Stiff', 'Pain']} onChange={value => edit({ kneeStatus: value })}/><ChoiceGroup label="BREATHING" value={session.breathingStatus} choices={['Normal', 'More than expected']} onChange={value => edit({ breathingStatus: value })}/><label className="notes-field"><span className="eyebrow">NOTES · OPTIONAL</span><textarea value={session.notes ?? ''} onChange={event => edit({ notes: event.target.value })} placeholder="Anything useful to remember next time?" rows={3}/></label></div>
    <button type="button" className="primary-button" disabled={!session.overallEffort || !session.kneeStatus || !session.breathingStatus} onClick={onSave}>SAVE SESSION <ArrowRight size={19}/></button><p className="save-assurance"><Check size={14}/> Your entries stay on this device.</p>
  </div>
}

export function CompletionScreen({ session, returnRecorded, onDone }: { session: WorkoutSession; returnRecorded: boolean; onDone: () => void }) {
  const summary = sessionSummary(session, new Date(session.completedAt!))
  return <div className="screen-content completion-screen"><div className="completion-symbol"><Check size={31}/></div><p className="eyebrow blue">SESSION SAVED</p><h1>Mission complete.</h1><p>{summary.minutes} min · {summary.workingSets} working sets</p>{returnRecorded && <div className="return-note">Return recorded. The normal A/B sequence is waiting where you left it.</div>}<button className="primary-button" type="button" onClick={onDone}>DONE <ArrowRight size={18}/></button></div>
}
