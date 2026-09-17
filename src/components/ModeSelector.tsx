import type { TrainingMode } from '../domain/models'

export type SelectableMode = Exclude<TrainingMode, 'RECOVERY'>
const modes: SelectableMode[] = ['GREEN', 'AMBER', 'RESET']

export function ModeSelector({ value, onChange }: { value: SelectableMode; onChange: (mode: SelectableMode) => void }) {
  return <div className="mode-choice"><span className="eyebrow">CHOOSE YOUR CAPACITY</span><div role="group" aria-label="Training mode">{modes.map(mode => <button type="button" key={mode} aria-pressed={value === mode} className={value === mode ? 'selected' : ''} onClick={() => onChange(mode)}>{mode}</button>)}</div><p>{value === 'GREEN' ? 'Normal training capacity.' : value === 'AMBER' ? 'A shorter session still counts.' : 'Return without progression pressure.'}</p></div>
}
