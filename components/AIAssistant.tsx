
import React, { useState } from 'react';
import { User, ScheduleEvent } from '../types';
import { askScheduleAssistant } from '../services/geminiService';
import { Bot, Loader2, Send, MessageCircle, Info, HelpCircle } from 'lucide-react';

interface AIAssistantProps {
  users: User[];
  events: ScheduleEvent[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ users, events }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const result = await askScheduleAssistant(users, events, query);
      setResponse(result);
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    { id: 'q1', text: "下星期邊個得閒？" },
    { id: 'q2', text: "Sally 幾時有空？" },
    { id: 'q3', text: "2月8號有咩搞？" }
  ];

  return (
    <div className="w-80 glass-card p-6 flex flex-col gap-6 h-full overflow-hidden border-l border-slate-200 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="bg-slate-700 p-1.5 rounded-lg shadow-slate-200 shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">人工智障仔</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          唔使再問『幾時得閒』，我幫你成班人夾好晒。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pr-1">
        {response ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm relative group">
              <div className="absolute -top-2 -left-2 bg-indigo-600 text-white p-1 rounded-lg shadow-md">
                <MessageCircle className="w-3 h-3" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {response}
              </p>
              <button 
                onClick={() => { setResponse(null); setQuery(''); }}
                className="mt-3 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider"
              >
                Clear Conversation
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 opacity-60">
            <div className="text-center py-8">
              <div className="p-4 bg-slate-50 rounded-full inline-block mb-3 border border-slate-100">
                <HelpCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Try asking...</p>
            </div>
            <div className="space-y-2">
              {quickQueries.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setQuery(q.text); }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition-all active:scale-[0.98]"
                >
                  "{q.text}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="mt-auto space-y-3 pt-4 border-t border-slate-100">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about the schedule..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1.5 p-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all active:scale-90"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        
        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
          <div className="flex items-start gap-2">
            <Info className="w-3 h-3 text-indigo-400 mt-0.5" />
            <p className="text-[10px] text-indigo-700/70 font-medium leading-tight">
              AI has access to all friend schedules and group events for Feb/March 2026.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
