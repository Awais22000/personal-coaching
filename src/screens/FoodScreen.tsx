import { Droplets, Moon, Sun, Sunrise, Utensils, Zap } from 'lucide-react'

const meals = [
  { time: 'MORNING', title: 'Breakfast', note: 'Protein + normal breakfast', icon: Sunrise },
  { time: 'MIDDAY', title: 'Lunch', note: 'Protein + controlled rice or roti + vegetables', icon: Sun },
  { time: '5:30–6 PM', title: 'Hunger bridge', note: 'Optional, if you need it before getting home', icon: Zap },
  { time: '~8 PM', title: 'Pre-workout dinner', note: 'A controlled portion before the gym', icon: Utensils },
  { time: 'AFTER TRAINING', title: 'Post-workout', note: 'Whey protein is enough when appetite is low', icon: Moon },
]
export function FoodScreen() { return <div className="screen-content"><div className="page-intro"><div><p className="eyebrow blue">SIMPLE, REPEATABLE FUEL</p><h1>Food</h1><p className="muted">Normal meals. Better portions. Steady protein.</p></div></div><div className="info-banner">A practical day, built around your late training window.</div><section className="section-block"><div className="section-title"><div><span className="eyebrow">DAILY RHYTHM</span><h3>Eat to support the work</h3></div></div><div className="timeline">{meals.map(({ time, title, note, icon: Icon }) => <div className="timeline-item" key={title}><div className="timeline-icon"><Icon size={18}/></div><div><span className="eyebrow">{time}</span><h4>{title}</h4><p>{note}</p></div></div>)}</div></section><section className="water-card"><Droplets size={22}/><div><span className="eyebrow">WATER</span><h3>Keep it visible</h3><p>Start with a glass at each meal and keep water nearby during the day.</p></div></section></div> }
