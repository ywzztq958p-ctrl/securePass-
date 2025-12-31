
import React, { useEffect, useState, useRef } from 'react';
import { Camera, CheckCircle2, XCircle, AlertTriangle, RefreshCcw, Keyboard, Send } from 'lucide-react';

interface ScannerViewProps {
  onScan: (data: string) => { success: boolean; message: string; holder?: string; ticket?: any };
  eventName: string;
}

declare const Html5QrcodeScanner: any;

const ScannerView: React.FC<ScannerViewProps> = ({ onScan, eventName }) => {
  const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error' | 'warning', message: string, holder?: string } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    });

    scanner.render((decodedText: string) => {
      processScan(decodedText);
    }, (error: any) => {
      // Non-critical scanning errors
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error: any) => console.error("Scanner clear error", error));
      }
    };
  }, []);

  const processScan = (code: string) => {
    const scanResult = onScan(code);
    setResult({
      status: scanResult.success ? 'success' : (scanResult.message === 'DÉJÀ SCANNÉ' ? 'warning' : 'error'),
      message: scanResult.message,
      holder: scanResult.holder || scanResult.ticket?.holderName
    });
    
    setTimeout(() => setResult(null), 3500);
    setManualCode('');
    setShowManualInput(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScan(manualCode.trim());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto h-full justify-center">
      <div className="text-center">
        <div className="inline-block bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-500/20">
          Contrôle: {eventName}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Scanner de Billets</h2>
        <p className="text-slate-400 text-sm">Prêt pour le contrôle des accès</p>
      </div>

      <div className="relative w-full aspect-square bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-2xl transition-all">
        <div id="reader" className={`w-full h-full ${showManualInput ? 'opacity-20 grayscale' : 'opacity-100'}`}></div>
        
        {showManualInput && !result && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full space-y-4">
              <div className="text-center mb-2">
                <Keyboard className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white uppercase">Saisie Manuelle</h3>
                <p className="text-xs text-slate-400">Entrez le code ID du billet</p>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <input 
                  autoFocus
                  type="text" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: TKT-VIP-001"
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-center focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-widest"
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition-colors"
                  >
                    ANNULER
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    VALIDER <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {result && (
          <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 ${
            result.status === 'success' ? 'bg-emerald-500/90' : 
            result.status === 'warning' ? 'bg-amber-500/90' : 'bg-red-500/90'
          }`}>
            {result.status === 'success' ? <CheckCircle2 className="w-20 h-20 text-white mb-4" /> : 
             result.status === 'warning' ? <AlertTriangle className="w-20 h-20 text-white mb-4" /> : 
             <XCircle className="w-20 h-20 text-white mb-4" />}
            
            <h3 className="text-3xl font-black text-white">{result.message}</h3>
            {result.holder && <p className="text-white font-medium mt-2 text-lg uppercase tracking-wider">{result.holder}</p>}
          </div>
        )}

        {!showManualInput && !result && (
          <>
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg pointer-events-none z-10"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg pointer-events-none z-10"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg pointer-events-none z-10"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-lg pointer-events-none z-10"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-400/30 blur-[1px] animate-pulse z-10"></div>
          </>
        )}
      </div>

      <div className="w-full flex gap-3">
        <div className="flex-1 bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Camera className="text-emerald-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Source</p>
              <p className="text-sm font-bold text-white">Caméra Arrière</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
          >
            <RefreshCcw className="w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <button 
          onClick={() => setShowManualInput(true)}
          className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            showManualInput ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'
          }`}
        >
          <div className={`${showManualInput ? 'bg-emerald-500' : 'bg-slate-800'} p-2 rounded-lg transition-colors`}>
            <Keyboard className={`${showManualInput ? 'text-white' : 'text-slate-400'} w-5 h-5`} />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alternative</p>
            <p className="text-sm font-bold text-white">Saisie Manuelle</p>
          </div>
        </button>
      </div>

      <p className="text-[10px] text-slate-600 font-bold text-center uppercase tracking-[0.2em]">
        Neon Pulse Festival • Security Operations Center
      </p>
    </div>
  );
};

export default ScannerView;
