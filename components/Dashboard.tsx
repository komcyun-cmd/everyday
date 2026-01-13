
import React from 'react';
import { WeatherData, Quote, HistoryEvent, AppState, Recurrence } from '../types';
import ScheduleList from './ScheduleList';
import MemoSection from './MemoSection';
import GoalTracker from './GoalTracker';
import { 
  CloudIcon, 
  QuoteIcon, 
  HistoryIcon, 
  ExternalLinkIcon,
  WindIcon,
  SunIcon,
  CheckCircle2Icon
} from 'lucide-react';

interface DashboardProps {
  activeTab: 'home' | 'schedule' | 'memo' | 'goals';
  weather: WeatherData | null;
  quote: Quote | null;
  history: HistoryEvent | null;
  state: AppState;
  actions: {
    toggleSchedule: (id: string) => void;
    removeSchedule: (id: string) => void;
    addSchedule: (title: string, time: string, recurrence: Recurrence) => void;
    addMemo: (content: string) => void;
    removeMemo: (id: string) => void;
    updateGoal: (id: string, val: number) => void;
    addGoal: (title: string, target: number, unit: string) => void;
    removeGoal: (id: string) => void;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, weather, quote, history, state, actions }) => {
  if (activeTab === 'schedule') return <ScheduleList items={state.schedules} onToggle={actions.toggleSchedule} onRemove={actions.removeSchedule} onAdd={actions.addSchedule} />;
  if (activeTab === 'memo') return <MemoSection memos={state.memos} onAdd={actions.addMemo} onRemove={actions.removeMemo} />;
  if (activeTab === 'goals') return <GoalTracker goals={state.goals} onUpdate={actions.updateGoal} onAdd={actions.addGoal} onRemove={actions.removeGoal} />;

  const today = new Date().toISOString().split('T')[0];
  const completedToday = state.schedules.filter(s => s.completedDates.includes(today)).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">반가워요! 👋</h2>
          <p className="text-slate-500 font-medium">오늘의 스마트 브리핑을 확인하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weather && (
          <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <CloudIcon size={128} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-blue-100">
                <SunIcon size={16} />
                <span className="font-semibold uppercase tracking-wider text-xs">Real-time Precise Weather</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{weather.location}</h3>
              <p className="text-sm text-blue-100 mb-8">{weather.description}</p>
              <div className="flex items-end gap-4">
                <span className="text-7xl font-black tracking-tighter">{weather.temp}°</span>
                <div className="pb-2">
                  <p className="text-xl font-bold">{weather.condition}</p>
                  <p className="text-sm opacity-70">구글 검색 기반 실시간 데이터</p>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex flex-wrap gap-4 text-blue-50">
                <div className="flex items-center gap-2">
                  <WindIcon size={16} className="opacity-70" />
                  <span className="text-xs font-medium">현재 위치 정밀 탐색됨</span>
                </div>
                {weather.sources && weather.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-auto">
                    {weather.sources.slice(0, 2).map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-[10px] font-medium">
                        <ExternalLinkIcon size={12} /> Source
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">오늘의 진행도</h3>
            <p className="text-sm text-slate-500">당신의 하루가 차곡차곡 쌓이고 있어요.</p>
          </div>
          <div className="mt-8">
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-black text-slate-800">{state.schedules.length > 0 ? Math.round((completedToday / state.schedules.length) * 100) : 0}%</span>
              <span className="text-sm font-bold text-slate-400">{completedToday} / {state.schedules.length} 완료</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${state.schedules.length > 0 ? (completedToday / state.schedules.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quote && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="absolute top-6 left-6 text-slate-100 group-hover:text-blue-50 transition-colors">
              <QuoteIcon size={64} />
            </div>
            <div className="relative z-10 text-center space-y-4">
              <p className="text-2xl font-medium text-slate-700 leading-snug italic">"{quote.text}"</p>
              <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full"></div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">— {quote.author}</p>
            </div>
          </div>
        )}
        {history && (
          <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 opacity-10">
              <HistoryIcon size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-800 rounded-full text-[10px] font-bold tracking-widest uppercase text-indigo-300">On This Day</span>
                <span className="text-indigo-400 text-xs font-bold">{history.year}년</span>
              </div>
              <h4 className="text-2xl font-bold mb-3">{history.event}</h4>
              <p className="text-indigo-200/80 leading-relaxed mb-6 line-clamp-3">{history.description}</p>
              {history.sources && history.sources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {history.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-800/50 hover:bg-indigo-700 transition-colors rounded-xl text-xs font-medium">
                      <ExternalLinkIcon size={14} /> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
