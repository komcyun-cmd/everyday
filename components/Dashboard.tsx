
import React, { useState } from 'react';
import { WeatherData, Quote, HistoryEvent, AppState, Recurrence } from '../types';
import ScheduleList from './ScheduleList';
import MemoSection from './MemoSection';
import GoalTracker from './GoalTracker';
import { 
  CloudIcon, 
  QuoteIcon, 
  HistoryIcon, 
  ExternalLinkIcon 
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

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Weather Card */}
      {weather && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-blue-100 font-medium">{weather.location}</p>
              <h2 className="text-3xl font-bold">{weather.temp}°C</h2>
            </div>
            <CloudIcon className="w-12 h-12 text-blue-200" />
          </div>
          <p className="text-sm opacity-90">{weather.condition} · {weather.description}</p>
        </div>
      )}

      {/* Quote Card */}
      {quote && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <QuoteIcon className="absolute -top-2 -left-2 w-12 h-12 text-slate-50 opacity-10" />
          <p className="text-slate-700 italic font-medium leading-relaxed mb-3">"{quote.text}"</p>
          <p className="text-sm text-slate-400 text-right">— {quote.author}</p>
        </div>
      )}

      {/* History Today */}
      {history && (
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
          <div className="flex items-center gap-2 mb-3 text-indigo-700">
            <HistoryIcon className="w-5 h-5" />
            <h3 className="font-bold">역사 속 오늘: {history.year}년</h3>
          </div>
          <h4 className="font-semibold text-indigo-900 mb-2">{history.event}</h4>
          <p className="text-sm text-indigo-800 opacity-80 leading-snug mb-3">{history.description}</p>
          {history.sources && history.sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {history.sources.map((s, i) => (
                <a 
                  key={i} 
                  href={s.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] bg-white text-indigo-600 px-2 py-1 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  <ExternalLinkIcon className="w-3 h-3" />
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Widget */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-xs text-slate-400 mb-1">오늘의 할 일</p>
          <p className="text-xl font-bold text-slate-800">
            {state.schedules.filter(s => s.completedDates.includes(new Date().toISOString().split('T')[0])).length} / {state.schedules.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-xs text-slate-400 mb-1">메모 수</p>
          <p className="text-xl font-bold text-slate-800">{state.memos.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
