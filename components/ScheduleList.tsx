
import React, { useState } from 'react';
import { ScheduleItem, Recurrence } from '../types';
import { CheckCircle2Icon, CircleIcon, Trash2Icon, PlusIcon, ClockIcon } from 'lucide-react';

interface ScheduleListProps {
  items: ScheduleItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (title: string, time: string, recurrence: Recurrence) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ items, onToggle, onRemove, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAdd(title, time, recurrence);
    setTitle('');
    setTime('');
    setRecurrence('none');
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">나의 일정</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <input 
            type="text" 
            placeholder="어떤 일을 하시나요?"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="time" 
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
            <select 
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none text-sm"
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as Recurrence)}
            >
              <option value="none">반복 없음</option>
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매달</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            추가하기
          </button>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center py-10 text-slate-400">등록된 일정이 없습니다.</p>
        ) : (
          items.map(item => {
            const isCompleted = item.completedDates.includes(today);
            return (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <button onClick={() => onToggle(item.id)} className="transition-colors">
                    {isCompleted 
                      ? <CheckCircle2Icon className="w-6 h-6 text-green-500" /> 
                      : <CircleIcon className="w-6 h-6 text-slate-300 hover:text-blue-400" />
                    }
                  </button>
                  <div>
                    <h4 className={`font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      {item.time && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {item.time}</span>}
                      {item.recurrence !== 'none' && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">{item.recurrence === 'daily' ? '매일' : item.recurrence === 'weekly' ? '매주' : '매달'}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
