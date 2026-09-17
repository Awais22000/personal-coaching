import { useEffect, useState } from 'react'
import { Activity, BookOpen, ChartNoAxesColumn, CircleUserRound, Dumbbell, UtensilsCrossed } from 'lucide-react'
import type { AppData } from './domain/models'
import { deleteCompletedSession, loadAppData, nextWorkoutId, saveAppData, saveSession, startWorkout } from './services/appService'
import { TodayScreen } from './screens/TodayScreen'
import { TrainScreen } from './screens/TrainScreen'
import { FoodScreen } from './screens/FoodScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { LearnScreen } from './screens/LearnScreen'
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen'
import { CompletionScreen, DebriefScreen } from './screens/DebriefScreen'
import { SessionDetail } from './components/SessionHistory'
import type { WorkoutSession } from './domain/models'

type Tab = 'today' | 'train' | 'food' | 'progress' | 'learn'
const tabs = [
  { id: 'today', label: 'TODAY', icon: Activity }, { id: 'train', label: 'TRAIN', icon: Dumbbell },
  { id: 'food', label: 'FOOD', icon: UtensilsCrossed }, { id: 'progress', label: 'PROGRESS', icon: ChartNoAxesColumn },
  { id: 'learn', label: 'LEARN', icon: BookOpen },
] as const

export default function App() {
  const [data, setData] = useState<AppData>(loadAppData)
  const [tab, setTab] = useState<Tab>('today')
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [completion, setCompletion] = useState<WorkoutSession | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  useEffect(() => saveAppData(data), [data])
  const nextId = nextWorkoutId(data.sessions)
  const begin = () => { setData(current => startWorkout(current)); setHistoryId(null); setCompletion(null); setNotice(null); setTab('train') }
  const dispatch = (edit: (data: AppData) => AppData) => setData(current => edit(current))
  const save = () => { const next = saveSession(data); if (next === data) return; setData(next); setCompletion(next.sessions.at(-1)!); setTab('train') }
  const deleteHistory = (id: string) => { setData(current => deleteCompletedSession(current, id)); setHistoryId(null); setNotice('Workout deleted.') }
  const history = historyId ? data.sessions.find(session => session.id === historyId) : null
  return <div className="app-shell">
    <header className="app-header"><div className="header-inner"><div className="brand"><div className="brand-icon"><Activity size={21} strokeWidth={2.2}/></div><div><strong>AWA<span>IS</span></strong><small>RESET PROTOCOL</small></div></div><div className="header-right"><span className="release">R1.1 / LIVE LOGGER</span><div className="avatar"><CircleUserRound size={22}/></div></div></div></header>
    <div className="app-layout"><nav className="desktop-nav" aria-label="Primary navigation"><div className="nav-caption">COMMAND CENTER</div>{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}><Icon size={19}/>{label}</button>)}<div className="nav-footer">COMMAND → EXECUTE<br/>RECORD → ADAPT → RETURN</div></nav><main id="main-content">
      {tab === 'today' && <TodayScreen data={data} nextId={nextId} onMode={mode => setData(current => ({ ...current, preferredMode: mode }))} onStart={begin} onTrain={() => setTab('train')}/>}
      {tab === 'train' && !data.activeWorkout && !completion && !history && notice && <div className="history-notice" role="status">{notice}</div>}
      {tab === 'train' && (data.activeWorkout ? data.activeWorkout.phase === 'debrief' ? <DebriefScreen data={data} dispatch={dispatch} onSave={save}/> : <ActiveWorkoutScreen data={data} dispatch={dispatch}/> : completion ? <CompletionScreen session={completion} returnRecorded={data.returnEvents.some(event => event.sessionId === completion.id)} onDone={() => { setCompletion(null); setTab('today') }}/> : history ? <SessionDetail session={history} onBack={() => setHistoryId(null)} onDelete={deleteHistory}/> : <TrainScreen data={data} nextId={nextId} onMode={mode => setData(current => ({ ...current, preferredMode: mode }))} onStart={begin} onOpenHistory={id => { setNotice(null); setHistoryId(id) }}/>)}
      {tab === 'food' && <FoodScreen/>}{tab === 'progress' && <ProgressScreen data={data}/ >}{tab === 'learn' && <LearnScreen/>}
    </main></div>
    <nav className="mobile-nav" aria-label="Primary navigation">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}><Icon size={21} strokeWidth={tab === id ? 2.3 : 1.9}/><span>{label}</span></button>)}</nav>
  </div>
}
