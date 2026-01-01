
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ShieldAlert, AlertOctagon, Zap, ShieldQuestion } from 'lucide-react';
import { askSecurityAI } from '../services/gemini';
import { SecurityStats } from '../types';

interface SecurityAIProps {
  stats: SecurityStats;
}

const SecurityAI: React.FC<SecurityAIProps> = ({ stats }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "COMMANDER-1 en ligne. Rapport de situation : " + ((stats.scannedCount / stats.totalExpected) * 100).toFixed(1) + "% d'occupation. En attente de directives." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsLoading(true);

    const response = await askSecurityAI(textToSend, stats);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response || "Erreur de transmission." }]);
    setIsLoading(false);
  };

  const triggerEmergency = () => {
    handleSend("ALERTE URGENCE : Procédure immédiate pour évacuation ou incident grave !");
  };

  const suggestions = [
    "Analyse des menaces",
    "Objets interdits ?",
    "Protocole malaise",
    "Capacité critique ?"
  ];

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-500">
      <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-900/40">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase tracking-tighter">Commander-1 IA</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Lien Tactique Actif</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={triggerEmergency}
          className="bg-red-600 hover:bg-red-500 p-3 rounded-2xl border-2 border-red-400/30 animate-pulse transition-all active:scale-90"
          title="URGENCE"
        >
          <AlertOctagon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed ${
              m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-xl shadow-emerald-950/20' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-xl'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {suggestions.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(s)}
              className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition-all shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Interroger l'IA tactique..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 p-4 rounded-2xl transition-all shadow-xl shadow-emerald-950/40 active:scale-95 group"
          >
            <Send className="w-6 h-6 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAI;
