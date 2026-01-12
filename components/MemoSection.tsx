
import React, { useState } from 'react';
import { Memo } from '../types';
import { Trash2Icon, PlusIcon, SendIcon } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">간편 메모</h2>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea 
          placeholder="잊지 않게 메모를 남겨보세요..."
          className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] resize-none text-slate-700"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {memos.map(memo => (
          <div key={memo.id} className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 relative group animate-in zoom-in-95 duration-200">
            <p className="text-sm text-slate-800 leading-relaxed break-words">{memo.content}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{new Date(memo.updatedAt).toLocaleDateString()}</span>
              <button 
                onClick={() => onRemove(memo.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2Icon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoSection;
