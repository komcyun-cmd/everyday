
import React, { useState, useEffect, useCallback } from 'https://esm.sh/react@19.0.0';
import { getDailyInsight } from './services/geminiService';
import { AppState, WeatherData, Quote, HistoryEvent, ScheduleItem, Memo, Goal, Recurrence } from './types';
import Dashboard from './components/Dashboard';
import { 
  CloudIcon, 
  CalendarIcon, 
  StickyNoteIcon, 
  TargetIcon, 
  RefreshCwIcon,
  AlertCircleIcon
} from 'https://esm.sh/lucide-react@0.446.0';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'memo' | 'goals'>('home');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<HistoryEvent | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('app_state');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("LocalStorage error", e); }
    return { schedules: [], memos: [], goals: [] };
  });

  useEffect(() => {
    localStorage.setItem('app_state', JSON.stringify(state));
  }, [state]);

  const refreshAI = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const data = await getDailyInsight(pos.coords.latitude, pos.coords.longitude);
            setWeather(data.weather || null);
            setQuote(data.quote || null);
            setHistory(data.history || null);
            setLoading(false);
          },
          async () => {
            const data = await getDailyInsight();
            setWeather(null);
            setQuote(data.quote || null);
            setHistory(data.history || null);
            setLoading(false);
          },
          { timeout: 5000 }
        );
      } else {
        const data = await getDailyInsight();
        setQuote(data.quote || null);
        setHistory(data.history || null);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("AI 데이터를 가져오는 데 실패했습니다.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAI();
  }, [refreshAI]);

  const actions = {
    toggleSchedule: (id: string) => {
      const today = new Date().toISOString().split('T')[0];
      setState(prev => ({
        ...prev,
        schedules: prev.schedules.map(s => {
          if (s.id !== id) return s;
          const isCompleted = s.completedDates.includes(today);
          return {
            ...s,
            completedDates: isCompleted 
              ? s.completedDates.filter(d => d !== today)
              : [...s.completedDates, today]
          };
        })
      }));
    },
    removeSchedule: (id: string) => setState(prev => ({ ...prev, schedules: prev.schedules.filter(s => s.id !== id) })),
    addSchedule: (title: string, time: string, recurrence: Recurrence) => {
      const newItem: ScheduleItem = { id: Math.random().toString(36).substr(2, 9), title, time, recurrence, completedDates: [] };
      setState(prev => ({ ...prev, schedules: [...prev.schedules, newItem] }));
    },
    addMemo: (content: string) => {
      const newMemo: Memo = { id: Math.random().toString(36).substr(2, 9), content, updatedAt: Date.now() };
      setState(prev => ({ ...prev, memos: [newMemo, ...prev.memos] }));
    },
    removeMemo: (id: string) => setState(prev => ({ ...prev, memos: prev.memos.filter(m => m.id !== id) })),
    updateGoal: (goalId: string, value: number) => {
      const today = new Date().toISOString().split('T')[0];
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g => {
          if (g.id !== goalId) return g;
          const idx = g.entries.findIndex(e => e.date === today);
          const newEntries = [...g.entries];
          if (idx > -1) newEntries[idx].value += value;
          else newEntries.push({ date: today, value });
          return { ...g, entries: newEntries };
        })
      }));
    },
    addGoal: (title: string, target: number, unit: string) => {
      const newGoal: Goal = { id: Math.random().toString(36).substr(2, 9), title, target, unit, entries: [] };
      setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    },
    removeGoal: (id: string) => setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          AI Dashboard
        </h1>
        <button onClick={refreshAI} disabled={loading} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50">
          <RefreshCwIcon className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircleIcon className="w-10 h-10 text-red-400 mb-2" />
            <p className="text-slate-600 text-sm font-medium">{error}</p>
            <button onClick={refreshAI} className="mt-4 text-blue-600 text-sm font-bold">다시 시도</button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xs animate-pulse">AI가 데이터를 분석하고 있습니다...</p>
          </div>
        ) : (
          <Dashboard 
            activeTab={activeTab}
            weather={weather}
            quote={quote}
            history={history}
            state={state}
            actions={actions}
          />
        )}
      </main>

      <nav className="bg-white border-t flex items-center justify-around py-2 shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<CloudIcon />} label="홈" />
        <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<CalendarIcon />} label="일정" />
        <NavButton active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} icon={<StickyNoteIcon />} label="메모" />
        <NavButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<TargetIcon />} label="목표" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactElement, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all px-3 py-1 rounded-lg ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
