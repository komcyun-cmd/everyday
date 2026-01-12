
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
  AlertCircleIcon,
  LayoutDashboardIcon
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
          { timeout: 8000 }
        );
      } else {
        const data = await getDailyInsight();
        setQuote(data.quote || null);
        setHistory(data.history || null);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("AI 브레인에 접속하는 중 오류가 발생했습니다.");
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar / Mobile Nav */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <LayoutDashboardIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Daily AI</h1>
        </div>

        <nav className="px-4 py-2 space-y-1">
          <SidebarLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboardIcon />} label="대시보드" />
          <SidebarLink active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<CalendarIcon />} label="내 일정" />
          <SidebarLink active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} icon={<StickyNoteIcon />} label="간편 메모" />
          <SidebarLink active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<TargetIcon />} label="목표 추적" />
        </nav>

        <div className="mt-auto p-6 md:absolute md:bottom-0 md:w-64 border-t border-slate-100">
          <button 
            onClick={refreshAI} 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            AI 브리핑 새로고침
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-red-100">
              <AlertCircleIcon className="w-16 h-16 text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">문제가 발생했습니다</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <button onClick={refreshAI} className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">다시 시도</button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold">AI</div>
              </div>
              <p className="mt-8 text-slate-500 font-medium animate-pulse text-lg text-center">
                오늘의 통찰과 데이터를 불러오고 있습니다...
              </p>
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
        </div>
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactElement, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      active 
        ? 'bg-blue-50 text-blue-600 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    <span>{label}</span>
  </button>
);

export default App;
