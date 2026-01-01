
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Scan, 
  BarChart3, 
  History, 
  ShieldAlert, 
  Calendar
} from 'lucide-react';
import ScannerView from './components/ScannerView';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import EventsView from './components/EventsView';
import TicketPrintView from './components/TicketPrintView';
import { Ticket, ScanHistory, SecurityStats, Event } from './types';

const STORAGE_KEYS = {
  EVENTS: 'securepass_events',
  SCANS: 'securepass_scans',
  TICKETS: 'securepass_tickets',
  ACTIVE_EVENT: 'securepass_active_id'
};

const INITIAL_EVENTS: Event[] = [
  { id: 'ev-1', name: 'Neon Pulse Festival', date: '2024-08-15', location: 'Stade de France', capacity: 50000, status: 'active', category: 'Electro' },
  { id: 'ev-2', name: 'Jazz Under Stars', date: '2024-09-02', location: 'Jardins du Luxembourg', capacity: 1200, status: 'upcoming', category: 'Jazz' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'stats' | 'history' | 'events' | 'print'>('events');
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [scans, setScans] = useState<ScanHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCANS);
    return saved ? JSON.parse(saved) : [];
  });

  const [allTickets, setAllTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT) || 'ev-1';
  });

  const [printingEventId, setPrintingEventId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(scans));
  }, [scans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(allTickets));
  }, [allTickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT, activeEventId);
  }, [activeEventId]);

  const activeEvent = useMemo(() => 
    events.find(e => e.id === activeEventId) || events[0], 
  [events, activeEventId]);

  const ticketsMap = useMemo(() => {
    const map: Record<string, Ticket> = {};
    allTickets.forEach(t => {
      map[t.qrData] = t;
    });
    if (!map["TKT-VIP-001"]) {
      map["TKT-VIP-001"] = { id: "TKT-VIP-001", eventId: 'ev-1', holderName: "Jean Dupont", type: "VIP", seat: "A12", status: "valid", qrData: "TKT-VIP-001" };
    }
    return map;
  }, [allTickets]);

  const stats = useMemo<SecurityStats>(() => {
    const eventScans = scans.filter(s => s.eventId === activeEventId);
    const successfulScans = eventScans.filter(s => s.status === 'success');
    
    let vipCount = 0;
    successfulScans.forEach(s => {
      if (ticketsMap[s.ticketId]?.type === 'VIP') vipCount++;
    });

    return {
      totalExpected: activeEvent.capacity,
      scannedCount: successfulScans.length,
      vipCount: vipCount,
      anomalies: eventScans.filter(s => s.status !== 'success').length
    };
  }, [scans, activeEventId, activeEvent, ticketsMap]);

  const handleScanSuccess = useCallback((qrData: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const ticket = ticketsMap[qrData];

    let newScan: ScanHistory;

    if (!ticket) {
      newScan = {
        id: `sc-${Date.now()}`,
        eventId: activeEventId,
        timestamp,
        ticketId: qrData,
        status: 'error',
        message: "Code invalide"
      };
      setScans(prev => [newScan, ...prev]);
      return { success: false, message: "INVALIDE" };
    }

    if (ticket.eventId !== activeEventId) {
      newScan = {
        id: `sc-${Date.now()}`,
        eventId: activeEventId,
        timestamp,
        ticketId: qrData,
        status: 'error',
        message: "Mauvais événement"
      };
      setScans(prev => [newScan, ...prev]);
      return { success: false, message: "MAUVAIS EVENT" };
    }

    const alreadyScanned = scans.find(s => s.eventId === activeEventId && s.ticketId === qrData && s.status === 'success');
    if (alreadyScanned) {
      newScan = {
        id: `sc-${Date.now()}`,
        eventId: activeEventId,
        timestamp,
        ticketId: qrData,
        status: 'warning',
        message: "Déjà utilisé",
        holderName: ticket.holderName
      };
      setScans(prev => [newScan, ...prev]);
      return { success: false, message: "DÉJÀ SCANNÉ", holder: ticket.holderName };
    }

    newScan = {
      id: `sc-${Date.now()}`,
      eventId: activeEventId,
      timestamp,
      ticketId: qrData,
      status: 'success',
      message: "Entrée autorisée",
      holderName: ticket.holderName
    };
    setScans(prev => [newScan, ...prev]);

    return { success: true, message: "VALIDE", holder: ticket.holderName, ticket };
  }, [scans, activeEventId, ticketsMap]);

  const addEvent = (newEvent: Omit<Event, 'id' | 'status'>, numTickets: number) => {
    const eId = `ev-${Math.random().toString(36).substr(2, 5)}`;
    const event: Event = { ...newEvent, id: eId, status: 'upcoming' };
    
    const generated: Ticket[] = [];
    for(let i=1; i <= numTickets; i++) {
      const tId = `TKT-${eId.toUpperCase()}-${String(i).padStart(3, '0')}`;
      generated.push({
        id: tId,
        eventId: eId,
        holderName: `Client #${i}`,
        type: i % 10 === 0 ? 'VIP' : 'Standard',
        seat: `Zone ${String.fromCharCode(65 + Math.floor(i/50))} - ${i}`,
        status: 'valid',
        qrData: tId
      });
    }

    setEvents(prev => [...prev, event]);
    setAllTickets(prev => [...prev, ...generated]);
    setActiveTab('events');
  };

  const currentScans = useMemo(() => scans.filter(s => s.eventId === activeEventId), [scans, activeEventId]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0 print:hidden shadow-lg z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
            <ShieldAlert className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">SECURE<span className="text-emerald-400">PASS</span></h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Access Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[10px] font-black uppercase truncate max-w-[150px]">{activeEvent.name}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4 print:p-0 print:overflow-visible">
        {activeTab === 'events' && (
          <EventsView 
            events={events} 
            activeEventId={activeEventId} 
            onSelect={setActiveEventId} 
            onCreate={addEvent}
            onPrint={(id) => { setPrintingEventId(id); setActiveTab('print'); }}
          />
        )}
        {activeTab === 'scan' && <ScannerView onScan={handleScanSuccess} eventName={activeEvent.name} />}
        {activeTab === 'stats' && <DashboardView stats={stats} scans={currentScans} />}
        {activeTab === 'history' && <HistoryView scans={currentScans} />}
        {activeTab === 'print' && printingEventId && (
          <TicketPrintView 
            event={events.find(e => e.id === printingEventId)!} 
            tickets={allTickets.filter(t => t.eventId === printingEventId)}
            onBack={() => setActiveTab('events')}
          />
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around p-3 safe-bottom z-50 print:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon={<Calendar className="w-5 h-5" />} label="Events" />
        <NavButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<Scan className="w-5 h-5" />} label="Scan" />
        <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 className="w-5 h-5" />} label="Flux" />
        <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History className="w-5 h-5" />} label="Log" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-emerald-500/10' : ''}`}>
      {icon}
    </div>
    <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
