
import React, { useState } from 'react';
import { Goal } from '../types';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusIcon, Trash2Icon, TrendingUpIcon, ChevronRightIcon, TargetIcon } from 'lucide-react';

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
    setTitle(''); setTarget(''); setUnit(''); setShowAdd(false);
  };

  const handleUpdate = (goalId: string) => {
    const val = parseFloat(inputValue[goalId]);
    if (isNaN(val)) return;
    onUpdate(goalId, val);
    setInputValue(prev => ({ ...prev, [goalId]: '' }));
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">목표 추적</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md">
          <PlusIcon size={20} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 rounded-3xl p-6 space-y-4 shadow-sm animate-in slide-in-from-top-2">
          <input type="text" placeholder="목표 이름" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="flex gap-3">
            <input type="number" placeholder="목표 수치" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl" value={target} onChange={e => setTarget(e.target.value)} />
            <input type="text" placeholder="단위" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl" value={unit} onChange={e => setUnit(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">목표 등록</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300">
            <TargetIcon size={64} className="mb-4 opacity-10" />
            <p className="font-medium text-lg">아직 설정된 목표가 없습니다.</p>
          </div>
        ) : (
          goals.map(goal => {
            const total = goal.entries.reduce((sum, e) => sum + e.value, 0);
            const percentage = Math.min(Math.round((total / goal.target) * 100), 100);
            const chartData = goal.entries.slice(-7).map(e => ({ date: e.date, value: e.value }));

            return (
              <div key={goal.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><TrendingUpIcon size={20} className="text-indigo-500" />{goal.title}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">{total} / {goal.target} {goal.unit}</p>
                  </div>
                  <button onClick={() => onRemove(goal.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2Icon size={20} /></button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-indigo-600 uppercase"><span>Progress</span><span>{percentage}%</span></div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                <div className="h-28 w-full bg-slate-50/50 rounded-2xl p-2 border border-slate-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} /></LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-2">
                  <input type="number" placeholder="수치 추가" className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm" value={inputValue[goal.id] || ''} onChange={e => setInputValue(prev => ({ ...prev, [goal.id]: e.target.value }))} />
                  <button onClick={() => handleUpdate(goal.id)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1">입력 <ChevronRightIcon size={16} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default GoalTracker;
