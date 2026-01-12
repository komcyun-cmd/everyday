
import React, { useState, useEffect, useCallback } from 'react';
import { getDailyInsight } from './services/geminiService';
import { AppState, WeatherData, Quote, HistoryEvent, ScheduleItem, Memo, Goal, Recurrence } from './types';
import Dashboard from './components/Dashboard';
import { 
  CloudIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  StickyNoteIcon, 
  TargetIcon, 
  RefreshCwIcon,
  PlusIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'memo' | 'goals'>('home');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<HistoryEvent | null>(null);
  
  // App State persistent storage
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('app_state');
    if (saved) return JSON.parse(saved);
    return { schedules: [], memos: [], goals: [] };
  });

  useEffect(() => {
    localStorage.setItem('app_state', JSON.stringify(state));
  }, [state]);

  const refreshAI = useCallback(async () => {
    setLoading(true);
    try {
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
          setQuote(data.quote || null);
          setHistory(data.history || null);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAI();
  }, [refreshAI]);

  // Actions
  const addSchedule = (title: string, time: string, recurrence: Recurrence) => {
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      time,
      recurrence,
      completedDates: []
    };
    setState(prev => ({ ...prev, schedules: [...prev.schedules, newItem] }));
  };

  const toggleSchedule = (id: string) => {
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
  };

  const removeSchedule = (id: string) => {
    setState(prev => ({ ...prev, schedules: prev.schedules.filter(s => s.id !== id) }));
  };

  const addMemo = (content: string) => {
    const newMemo: Memo = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      updatedAt: Date.now()
    };
    setState(prev => ({ ...prev, memos: [newMemo, ...prev.memos] }));
  };

  const removeMemo = (id: string) => {
    setState(prev => ({ ...prev, memos: prev.memos.filter(m => m.id !== id) }));
  };

  const updateGoal = (goalId: string, value: number) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const existingEntryIdx = g.entries.findIndex(e => e.date === today);
        const newEntries = [...g.entries];
        if (existingEntryIdx > -1) {
          newEntries[existingEntryIdx].value += value;
        } else {
          newEntries.push({ date: today, value });
        }
        return { ...g, entries: newEntries };
      })
    }));
  };

  const addGoal = (title: string, target: number, unit: string) => {
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      target,
      unit,
      entries: []
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const removeGoal = (id: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          AI Dashboard
        </h1>
        <button 
          onClick={refreshAI} 
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCwIcon className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCwIcon className="w-10 h-10 animate-spin mb-4" />
            <p>AI가 정보를 가져오고 있습니다...</p>
          </div>
        ) : (
          <Dashboard 
            activeTab={activeTab}
            weather={weather}
            quote={quote}
            history={history}
            state={state}
            actions={{
              toggleSchedule, removeSchedule, addSchedule,
              addMemo, removeMemo,
              updateGoal, addGoal, removeGoal
            }}
          />
        )}
      </main>

      {/* Navigation */}
      <nav className="bg-white border-t flex items-center justify-around py-2 sticky bottom-0 z-10">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<CloudIcon />} label="홈" />
        <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<CalendarIcon />} label="일정" />
        <NavButton active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} icon={<StickyNoteIcon />} label="메모" />
        <NavButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<TargetIcon />} label="목표" />
      </nav>
    </div>
  );
};

// Fix for Line 197: Use React.isValidElement and cast to ReactElement with explicit props to safely clone and apply className
const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors px-4 py-1 rounded-lg ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {React.isValidElement(icon) 
      ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' }) 
      : icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default App;
