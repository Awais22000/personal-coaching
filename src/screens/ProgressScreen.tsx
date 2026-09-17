import { Activity, ArrowUpRight, Footprints, RotateCcw, Scale, TrendingUp } from 'lucide-react'
import type { AppData } from '../domain/models'

export function ProgressScreen({ data }: { data: AppData }) {
  const completed = data.sessions.filter(session => session.completedAt)
  const workingSets = completed.reduce((sum, session) => sum + session.exercises.reduce((count, log) => count + log.sets.filter(set => set.completed).length, 0), 0)
  const areas = [
    { title: 'Weight trend', icon: Scale, description: data.bodyWeights.length ? 'Logged weigh-ins on this device.' : 'Your weight entries will form a calm, long-view trend.', value: data.bodyWeights.length ? String(data.bodyWeights.length) : '—' },
    { title: 'Training sessions', icon: Activity, description: 'Completed and saved missions.', value: String(completed.length) },
    { title: 'Returns', icon: RotateCcw, description: 'RESET sessions saved as return evidence.', value: String(data.returnEvents.length) },
    { title: 'Running stage', icon: Footprints, description: 'Progress comes from capacity, not elapsed weeks.', value: data.profile.runningStage },
    { title: 'Strength progress', icon: TrendingUp, description: 'Working sets recorded across saved sessions.', value: workingSets ? String(workingSets) : '—' },
  ]
  return <div className="screen-content"><div className="page-intro"><div><p className="eyebrow blue">EVIDENCE OVER PERFECTION</p><h1>Progress</h1><p className="muted">A long view of the work you actually do.</p></div></div><div className="progress-statement"><span className="eyebrow">CURRENT STAGE</span><div><strong>{data.profile.runningStage}</strong><ArrowUpRight size={23}/></div><p>The base is where capacity begins.</p></div><section className="section-block"><div className="section-title"><div><span className="eyebrow">YOUR EVIDENCE</span><h3>Progress areas</h3></div></div><div className="progress-list">{areas.map(({ title, icon: Icon, description, value }) => <div className="progress-item" key={title}><div className="progress-icon"><Icon size={19}/></div><div><h4>{title}</h4><p>{description}</p></div><span>{value}</span></div>)}</div></section>{completed.length === 0 ? <div className="empty-state">No training evidence yet.<br/><span>Complete your first mission and it will appear here.</span></div> : <div className="empty-state">Training evidence is building.<br/><span>Open Train → Recent sessions to inspect each workout.</span></div>}</div>
}
