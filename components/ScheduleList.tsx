
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
    setTitle(''); setTime(''); setRecurrence('none'); setShowAdd(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">나의 일정</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md">
          <PlusIcon size={20} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white border border-blue-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <input type="text" placeholder="어떤 일을 하시나요?" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">시간</label>
              <input type="time" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">반복</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)}>
                <option value="none">반복 없음</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매달</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900">일정 추가</button>
        </form>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white py-20 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <p className="text-slate-400 font-medium">등록된 일정이 없습니다.</p>
          </div>
        ) : (
          items.map(item => {
            const isCompleted = item.completedDates.includes(today);
            return (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <button onClick={() => onToggle(item.id)}>
                    {isCompleted ? <CheckCircle2Icon size={28} className="text-green-500 fill-green-50" /> : <CircleIcon size={28} className="text-slate-200 hover:text-blue-400" />}
                  </button>
                  <div>
                    <h4 className={`text-lg font-semibold ${isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      {item.time && <span className="flex items-center gap-1"><ClockIcon size={12} /> {item.time}</span>}
                      {item.recurrence !== 'none' && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase font-bold text-[10px]">{item.recurrence}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2Icon size={20} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const CircleIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
);

export default ScheduleList;
