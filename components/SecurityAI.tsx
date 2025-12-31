
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ShieldQuestion, HelpCircle, AlertOctagon } from 'lucide-react';
import { askSecurityAI } from '../services/gemini';
import { SecurityStats } from '../types';

interface SecurityAIProps {
  stats: SecurityStats;
}

const SecurityAI: React.FC<SecurityAIProps> = ({ stats }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Bonjour. Je suis l'assistant IA de SecurePass. Comment puis-je vous aider dans vos missions de sécurité aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await askSecurityAI(userMsg, stats);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response || "Erreur de communication." }]);
    setIsLoading(false);
  };

  const suggestions = [
    "Quels sont les objets interdits ?",
    "Procédure en cas d'alerte incendie ?",
    "Analyses les dernières anomalies",
    "Protocole accès VIP ?"
  ];

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
      {/* AI Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-3">
        <div className="relative">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></div>
        </div>
        <div>
          <h3 className="font-bold text-white leading-none">Intelligence Sécurité</h3>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Personnel Autorisé Uniquement</p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4">
        {/* Quick Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {suggestions.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => setInput(s)}
              className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 transition-colors shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Posez une question sur le protocole..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 p-3 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAI;
