
import React, { useState } from 'react';
import { Memo } from '../types';
import { Trash2Icon, SendIcon, StickyNoteIcon } from 'lucide-react';

interface MemoSectionProps {
  memos: Memo[];
  onAdd: (content: string) => void;
  onRemove: (id: string) => void;
}

const MemoSection: React.FC<MemoSectionProps> = ({ memos, onAdd, onRemove }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(content);
    setContent('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">간편 메모</h2>
      <form onSubmit={handleSubmit} className="relative">
        <textarea placeholder="잊지 않게 메모를 남겨보세요..." className="w-full px-6 py-5 pr-16 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[160px] resize-none text-slate-700 text-lg shadow-sm" value={content} onChange={e => setContent(e.target.value)} />
        <button type="submit" className="absolute bottom-5 right-5 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
          <SendIcon size={24} />
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {memos.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300">
             <StickyNoteIcon size={48} className="mb-2 opacity-20" />
             <p className="font-medium">작성된 메모가 없습니다.</p>
          </div>
        ) : (
          memos.map(memo => (
            <div key={memo.id} className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 relative group animate-in zoom-in-95 duration-200 hover:rotate-1 transition-transform">
              <p className="text-slate-800 leading-relaxed break-words font-medium">{memo.content}</p>
              <div className="mt-6 flex items-center justify-between border-t border-yellow-200/50 pt-4">
                <span className="text-[10px] font-bold text-yellow-600/60 uppercase tracking-widest">{new Date(memo.updatedAt).toLocaleDateString()}</span>
                <button onClick={() => onRemove(memo.id)} className="p-2 text-yellow-600/40 hover:text-red-500 transition-all"><Trash2Icon size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default MemoSection;
