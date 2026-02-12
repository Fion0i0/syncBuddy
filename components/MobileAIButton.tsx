
import React, { useState, useRef, useEffect } from 'react';
import { User, ScheduleEvent } from '../types';
import { askScheduleAssistant } from '../services/geminiService';
import { Bot, Loader2, Send, MessageCircle, X, HelpCircle, Info, Trash2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface MobileAIButtonProps {
  users: User[];
  events: ScheduleEvent[];
}

export const MobileAIButton: React.FC<MobileAIButtonProps> = ({ users, events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const q = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const result = await askScheduleAssistant(users, events, q);
      setMessages(prev => [...prev, { role: 'assistant', text: result }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setQuery('');
  };

  const quickQueries = [
    { id: 'q1', text: "下星期邊個得閒？" },
    { id: 'q2', text: "Sally 幾時有空？" },
    { id: 'q3', text: "2月8號有咩搞？" }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-slate-700 rounded-full shadow-lg shadow-slate-300 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>

      {/* Full Screen Modal */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-700 text-white">
            <div className="flex items-center gap-2">
              <div className="bg-slate-600 p-1.5 rounded-lg">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold">人工智障仔</h3>
                <p className="text-[10px] text-slate-300 font-medium">唔使再問『幾時得閒』，我幫你成班人夾好晒。</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[80%] bg-slate-700 text-white p-3 rounded-2xl rounded-br-md">
                        <p className="text-sm font-medium">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] bg-slate-50 p-3 rounded-2xl rounded-bl-md border border-slate-200 relative">
                        <div className="absolute -top-2 -left-2 bg-slate-700 text-white p-1 rounded-lg shadow-md">
                          <MessageCircle className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium pt-1">
                          {msg.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-3 rounded-2xl rounded-bl-md border border-slate-200">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 opacity-60">
                <div className="text-center py-8">
                  <div className="p-4 bg-slate-50 rounded-full inline-block mb-3 border border-slate-100">
                    <HelpCircle className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Try asking...</p>
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
                  className="absolute right-2 top-1.5 p-2.5 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all active:scale-90"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
        </div>
      )}
    </>
  );
};
