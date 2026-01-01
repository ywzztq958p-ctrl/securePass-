
import React, { useEffect, useState, useRef } from 'react';
import { Camera, CheckCircle2, XCircle, AlertTriangle, RefreshCcw, Keyboard, Send, ShieldCheck, Zap } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerViewProps {
  onScan: (data: string) => { success: boolean; message: string; holder?: string; ticket?: any };
  eventName: string;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onScan, eventName }) => {
  const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error' | 'warning', message: string, holder?: string } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 15, 
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      rememberLastUsedCamera: true
    }, false);

    scanner.render((decodedText: string) => {
      processScan(decodedText);
    }, (error: any) => {
      // Lecture silencieuse en continu
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e: any) => console.warn("Cleanup scanner", e));
      }
    };
  }, []);

  const processScan = (code: string) => {
    if (result) return; // Évite les scans multiples trop rapides

    const scanResult = onScan(code);
    
    // Vibration tactique
    if ('vibrate' in navigator) {
      if (scanResult.success) navigator.vibrate(100);
      else navigator.vibrate([100, 50, 100]);
    }

    setResult({
      status: scanResult.success ? 'success' : (scanResult.message === 'DÉJÀ SCANNÉ' ? 'warning' : 'error'),
      message: scanResult.message,
      holder: scanResult.holder || scanResult.ticket?.holderName
    });
    
    setTimeout(() => setResult(null), 3000);
    setManualCode('');
    setShowManualInput(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScan(manualCode.trim().toUpperCase());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto h-full justify-center px-4">
      <div className="text-center w-full space-y-1">
        <div className="flex items-center justify-center gap-2 text-emerald-500 mb-1">
          <ShieldCheck className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Unit Access Control</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{eventName}</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Poste de Scan : Nord-Est / A1</p>
      </div>

      <div className="relative w-full aspect-square bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all ring-1 ring-slate-700/50">
        <div id="reader" className={`w-full h-full object-cover ${showManualInput ? 'opacity-20 grayscale scale-110' : 'opacity-100'} transition-all duration-500`}></div>
        
        {showManualInput && !result && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full space-y-6">
              <div className="text-center">
                <div className="bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-xl">
                  <Keyboard className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase">Saisie Manuelle</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID Unique du Billet</p>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input 
                  autoFocus
                  type="text" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="EX: TKT-A123"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-4 py-4 text-white font-mono text-xl text-center focus:outline-none focus:border-emerald-500 transition-all uppercase tracking-widest placeholder:text-slate-800"
                />
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase transition-all active:scale-95"
                  >
                    Retour
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
                  >
                    Valider <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {result && (
          <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 ${
            result.status === 'success' ? 'bg-emerald-600/95' : 
            result.status === 'warning' ? 'bg-amber-600/95' : 'bg-red-600/95'
          }`}>
            <div className="bg-white/20 p-8 rounded-[2rem] mb-4 backdrop-blur-md shadow-2xl">
              {result.status === 'success' ? <CheckCircle2 className="w-24 h-24 text-white" /> : 
               result.status === 'warning' ? <AlertTriangle className="w-24 h-24 text-white" /> : 
               <XCircle className="w-24 h-24 text-white" />}
            </div>
            
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{result.message}</h3>
            {result.holder && (
              <div className="mt-4 px-6 py-2 bg-black/30 rounded-full border border-white/10">
                <p className="text-white font-black text-lg uppercase tracking-wide">{result.holder}</p>
              </div>
            )}
          </div>
        )}

        {!showManualInput && !result && (
          <>
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl pointer-events-none z-10 opacity-60"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl pointer-events-none z-10 opacity-60"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl pointer-events-none z-10 opacity-60"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl pointer-events-none z-10 opacity-60"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-500/30 blur-[4px] animate-[pulse_1s_infinite] z-10"></div>
          </>
        )}
      </div>

      <div className="w-full flex gap-3">
        <div className="flex-1 bg-slate-900/80 backdrop-blur p-4 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
              <Camera className="text-emerald-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Flux Optique</p>
              <p className="text-[11px] font-bold text-white uppercase">Actif 60 FPS</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group border border-slate-700 active:scale-90"
          >
            <RefreshCcw className="w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <button 
          onClick={() => setShowManualInput(true)}
          className={`flex-1 flex items-center gap-3 p-4 rounded-3xl border transition-all shadow-xl active:scale-95 ${
            showManualInput ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/80 backdrop-blur border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className={`${showManualInput ? 'bg-emerald-500' : 'bg-slate-800'} p-2.5 rounded-2xl transition-colors border ${showManualInput ? 'border-emerald-400' : 'border-slate-700'}`}>
            <Keyboard className={`${showManualInput ? 'text-white' : 'text-slate-400'} w-5 h-5`} />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saisie</p>
            <p className="text-[11px] font-bold text-white uppercase">Override</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-2">
        <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Secure-Link v1.0.4 Ready
      </div>
    </div>
  );
};

export default ScannerView;
