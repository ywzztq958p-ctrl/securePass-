
import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { ScanHistory } from '../types';

interface HistoryViewProps {
  scans: ScanHistory[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ scans }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScans = scans.filter(scan => 
    scan.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase">Historique des Scans</h2>
          <p className="text-slate-500 text-sm">Journal complet des entrées et erreurs</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un billet ou un nom..."
            className="bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {filteredScans.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {filteredScans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors group">
                <div className="shrink-0">
                  {scan.status === 'success' ? (
                    <div className="bg-emerald-500/20 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                  ) : scan.status === 'warning' ? (
                    <div className="bg-amber-500/20 p-2 rounded-full"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
                  ) : (
                    <div className="bg-red-500/20 p-2 rounded-full"><XCircle className="w-5 h-5 text-red-500" /></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">
                      {scan.holderName || "Billet Inconnu"}
                    </p>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      {scan.ticketId}
                    </span>
                  </div>
                  <p className={`text-xs ${
                    scan.status === 'success' ? 'text-slate-500' : 'text-red-400 font-medium'
                  }`}>
                    {scan.message}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] font-bold text-slate-500">{scan.timestamp}</p>
                  <div className="flex justify-end mt-1">
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium">Aucun résultat trouvé pour cette recherche.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button className="text-xs font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">
          Exporter le rapport complet (.CSV)
        </button>
      </div>
    </div>
  );
};

export default HistoryView;
