
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Camera, CheckCircle2, XCircle, AlertTriangle, RefreshCcw, Keyboard, Send, ShieldCheck, Volume2, VolumeX, History } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerViewProps {
  onScan: (data: string) => { success: boolean; message: string; holder?: string; ticket?: any };
  eventName: string;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onScan, eventName }) => {
  const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error' | 'warning', message: string, holder?: string } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const scannerRef = useRef<any>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, []);

  const playSound = useCallback((type: 'success' | 'error') => {
    if (!isAudioEnabled || !audioCtx.current) return;
    
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.15);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.4);
    }
  }, [isAudioEnabled]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 25, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      rememberLastUsedCamera: true
    }, false);

    scanner.render((decodedText: string) => {
      processScan(decodedText);
    }, () => {});

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e: any) => console.warn("Cleanup scanner", e));
      }
    };
  }, []);

  const processScan = (code: string) => {
    if (result) return; 
    initAudio();

    const scanResult = onScan(code);
    
    if ('vibrate' in navigator) {
      if (scanResult.success) navigator.vibrate(80);
      else navigator.vibrate([100, 50, 100]);
    }

    playSound(scanResult.success ? 'success' : 'error');

    const status: any = scanResult.success ? 'success' : (scanResult.message === 'DÉJÀ SCANNÉ' ? 'warning' : 'error');
    setResult({
      status,
      message: scanResult.message,
      holder: scanResult.holder
    });
    
    setRecentScans(prev => [{ 
      code, 
      status, 
      holder: scanResult.holder, 
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    }, ...prev].slice(0, 3));

    setTimeout(() => setResult(null), 2000);
    setManualCode('');
    setShowManualInput(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-md mx-auto h-full px-2 py-4">
      <div className="text-center w-full space-y-1">
        <div className="flex items-center justify-center gap-2 text-emerald-500">
          <ShieldCheck className="w-4 h-4 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Access Point: Alpha-1</span>
        </div>
        <h2 className="text-xl font-black text-white uppercase truncate">{eventName}</h2>
      </div>

      <div className="relative w-full aspect-square bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-700/50">
        <div id="reader" className={`w-full h-full object-cover ${showManualInput ? 'opacity-20 grayscale' : 'opacity-100'} transition-all`}></div>
        
        {showManualInput && !result && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
            <div className="w-full space-y-6">
              <div className="text-center">
                <Keyboard className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Entrée Manuelle</h3>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if(manualCode) processScan(manualCode.toUpperCase()); }} className="space-y-4">
                <input 
                  autoFocus
                  type="text" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="ID BILLET"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-4 text-white font-mono text-xl text-center focus:outline-none focus:border-emerald-500 transition-all uppercase"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowManualInput(false)} className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase">Retour</button>
                  <button type="submit" className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-900/40">Confirmer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {result && (
          <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-150 ${
            result.status === 'success' ? 'bg-emerald-600/98' : 
            result.status === 'warning' ? 'bg-amber-600/98' : 'bg-red-600/98'
          }`}>
            <div className="bg-white/10 p-6 rounded-full mb-3 backdrop-blur-md border border-white/20 scale-110">
              {result.status === 'success' ? <CheckCircle2 className="w-20 h-20 text-white" /> : 
               result.status === 'warning' ? <AlertTriangle className="w-20 h-20 text-white" /> : 
               <XCircle className="w-20 h-20 text-white" />}
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{result.message}</h3>
            {result.holder && (
              <p className="mt-2 text-white font-black text-lg uppercase bg-black/20 px-4 py-1 rounded-full">{result.holder}</p>
            )}
          </div>
        )}
      </div>

      {/* Quick History Overlay */}
      <div className="w-full space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
          <History className="w-3 h-3" /> Derniers Passages
        </div>
        <div className="space-y-1.5">
          {recentScans.length > 0 ? recentScans.map((scan, i) => (
            <div key={i} className={`flex items-center justify-between p-2.5 rounded-2xl border bg-slate-900/50 animate-in slide-in-from-left duration-300 ${
              scan.status === 'success' ? 'border-emerald-500/20' : 
              scan.status === 'warning' ? 'border-amber-500/20' : 'border-red-500/20'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  scan.status === 'success' ? 'bg-emerald-500' : 
                  scan.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-[10px] font-black text-white uppercase">{scan.holder || "Code: " + scan.code}</p>
                  <p className="text-[8px] text-slate-500 font-bold">{scan.time}</p>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                scan.status === 'success' ? 'text-emerald-400' : 
                scan.status === 'warning' ? 'text-amber-400' : 'text-red-400'
              }`}>{scan.status}</span>
            </div>
          )) : (
            <div className="text-center py-4 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-[10px] text-slate-600 font-bold uppercase italic">En attente de scan...</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex gap-2 mt-auto">
        <button onClick={() => { initAudio(); setIsAudioEnabled(!isAudioEnabled); }} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex-1 flex items-center justify-center">
          {isAudioEnabled ? <Volume2 className="text-emerald-400 w-5 h-5" /> : <VolumeX className="text-slate-600 w-5 h-5" />}
        </button>
        <button onClick={() => setShowManualInput(true)} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex-[3] flex items-center justify-center gap-2 font-black text-[10px] text-white uppercase">
          <Keyboard className="w-4 h-4 text-emerald-400" /> Saisie Manuel
        </button>
        <button onClick={() => window.location.reload()} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex-1 flex items-center justify-center">
          <RefreshCcw className="text-slate-500 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ScannerView;
