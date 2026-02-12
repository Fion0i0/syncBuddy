
import React, { useState } from 'react';
import { User, ScheduleEvent } from '../types';
import { askScheduleAssistant } from '../services/geminiService';
import { Sparkles, Loader2, Send, MessageCircle, X, HelpCircle } from 'lucide-react';

interface MobileAIButtonProps {
  users: User[];
  events: ScheduleEvent[];
}

export const MobileAIButton: React.FC<MobileAIButtonProps> = ({ users, events }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    { id: 'q1', text: "Who is free next weekend?" },
    { id: 'q2', text: "When is Sally free?" },
    { id: 'q3', text: "What's happening on Feb 8?" }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Sparkles className="w-6 h-6 text-white fill-white/20" />
      </button>

      {/* Full Screen Modal */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 fill-white/20" />
              <h3 className="text-lg font-bold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {response ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-100 relative">
                  <div className="absolute -top-2 -left-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-md">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium pt-2">
                    {response}
                  </p>
                  <button
                    onClick={() => { setResponse(null); setQuery(''); }}
                    className="mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider"
                  >
                    Clear Conversation
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="p-4 bg-slate-50 rounded-full inline-block mb-3 border border-slate-100">
                    <HelpCircle className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Try asking...</p>
                </div>
                <div className="space-y-3">
                  {quickQueries.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuery(q.text)}
                      className="w-full text-left p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all active:scale-[0.98]"
                    >
                      "{q.text}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={handleAsk} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about the schedule..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-14 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-1.5 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all active:scale-90"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-400 font-medium">
                AI has access to all friend schedules and group events
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
