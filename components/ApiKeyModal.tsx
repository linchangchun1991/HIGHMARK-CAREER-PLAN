
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 10) {
      onSubmit(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-highmark-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-highmark-gold opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <Lock className="text-highmark-gold w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">系统安全验证</h2>
          <p className="text-highmark-100 text-sm">HighMark Career Architect System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Gemini API Authorization Key
            </label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your AI Studio API Key..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-highmark-gold focus:border-transparent outline-none text-slate-900 font-mono text-sm"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={key.length < 10}
            className="w-full bg-highmark-500 hover:bg-highmark-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            启动系统 <ArrowRight size={18} />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
             <ShieldCheck size={12} />
             <span>仅限海马职加内部顾问使用</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
