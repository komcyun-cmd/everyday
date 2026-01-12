
import React, { useState, useMemo } from 'react';
import { Goal, GoalEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlusIcon, Trash2Icon, TrendingUpIcon, ChevronRightIcon } from 'lucide-react';

interface GoalTrackerProps {
  goals: Goal[];
  onAdd: (title: string, target: number, unit: string) => void;
  onUpdate: (id: string, val: number) => void;
  onRemove: (id: string) => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, onAdd, onUpdate, onRemove }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [inputValue, setInputValue] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) return;
    onAdd(title, parseFloat(target), unit || '회');
    setTitle('');
    setTarget('');
    setUnit('');
    setShowAdd(false);
  };

  const handleUpdate = (goalId: string) => {
    const val = parseFloat(inputValue[goalId]);
    if (isNaN(val)) return;
    onUpdate(goalId, val);
    setInputValue(prev => ({ ...prev, [goalId]: '' }));
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">목표 달성율</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
          <input 
            type="text" 
            placeholder="목표 이름 (예: 물 마시기)"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="목표 수치"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
              value={target}
              onChange={e => setTarget(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="단위 (L, 회...)"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">추가하기</button>
        </form>
      )}

      {goals.map(goal => {
        const total = goal.entries.reduce((sum, e) => sum + e.value, 0);
        const percentage = Math.min(Math.round((total / goal.target) * 100), 100);
        
        // Prepare data for chart
        const chartData = goal.entries.slice(-7).map(e => ({
          date: e.date.split('-').slice(1).join('/'),
          value: e.value
        }));

        return (
          <div key={goal.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUpIcon className="w-4 h-4 text-blue-500" />
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-400">{total} / {goal.target} {goal.unit}</p>
              </div>
              <button onClick={() => onRemove(goal.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="h-24 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" hide />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">누적 데이터가 없습니다.</div>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="오늘 수치 입력"
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={inputValue[goal.id] || ''}
                onChange={e => setInputValue(prev => ({ ...prev, [goal.id]: e.target.value }))}
              />
              <button 
                onClick={() => handleUpdate(goal.id)}
                className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                입력 <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoalTracker;
