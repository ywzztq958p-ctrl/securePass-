
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Scan, 
  BarChart3, 
  History, 
  ShieldAlert, 
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquareCode
} from 'lucide-react';
import ScannerView from './components/ScannerView';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import SecurityAI from './components/SecurityAI';
import EventsView from './components/EventsView';
import { Ticket, ScanHistory, SecurityStats, Event } from './types';

const MOCK_TICKETS: Record<string, Ticket> = {
  "TKT-VIP-001": { id: "TKT-VIP-001", holderName: "Jean Dupont", type: "VIP", seat: "A12", status: "valid" },
  "TKT-STD-054": { id: "TKT-STD-054", holderName: "Marie Curie", type: "Standard", seat: "B45", status: "valid" },
  "TKT-VIP-002": { id: "TKT-VIP-002", holderName: "Paul Valéry", type: "VIP", seat: "A13", status: "valid" },
};

const INITIAL_EVENTS: Event[] = [
  { id: 'ev-1', name: 'Neon Pulse Festival', date: '2024-08-15', location: 'Stade de France', capacity: 50000, status: 'active', category: 'Electro' },
  { id: 'ev-2', name: 'Jazz Under Stars', date: '2024-09-02', location: 'Jardins du Luxembourg', capacity: 1200, status: 'upcoming', category: 'Jazz' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'stats' | 'history' | 'ai' | 'events'>('events');
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [activeEventId, setActiveEventId] = useState<string>('ev-1');
  const [scans, setScans] = useState<ScanHistory[]>([]);

  const activeEvent = useMemo(() => 
    events.find(e => e.id === activeEventId) || events[0], 
  [events, activeEventId]);

  const stats = useMemo<SecurityStats>(() => {
    const eventScans = scans.filter(s => s.eventId === activeEventId);
    const successfulScans = eventScans.filter(s => s.status === 'success');
    
    // For the demo, we check types by looking at our mock map
    let vipCount = 0;
    successfulScans.forEach(s => {
      if (MOCK_TICKETS[s.ticketId]?.type === 'VIP') vipCount++;
    });

    return {
      totalExpected: activeEvent.capacity,
      scannedCount: successfulScans.length,
      vipCount: vipCount,
      anomalies: eventScans.filter(s => s.status !== 'success').length
    };
  }, [scans, activeEventId, activeEvent]);

  const handleScanSuccess = useCallback((qrData: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const ticket = MOCK_TICKETS[qrData];

    if (!ticket) {
      const newScan: ScanHistory = {
        id: Math.random().toString(36).substr(2, 9),
        eventId: activeEventId,
        timestamp,
        ticketId: qrData,
        status: 'error',
        message: "Code invalide ou inconnu"
      };
      setScans(prev => [newScan, ...prev]);
      return { success: false, message: "BILLET INVALIDE" };
    }

    const alreadyScanned = scans.find(s => s.eventId === activeEventId && s.ticketId === qrData && s.status === 'success');
    if (alreadyScanned) {
      const newScan: ScanHistory = {
        id: Math.random().toString(36).substr(2, 9),
        eventId: activeEventId,
        timestamp,
        ticketId: qrData,
        status: 'warning',
        message: "Billet déjà utilisé",
        holderName: ticket.holderName
      };
      setScans(prev => [newScan, ...prev]);
      return { success: false, message: "DÉJÀ SCANNÉ", holder: ticket.holderName };
    }

    const newScan: ScanHistory = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: activeEventId,
      timestamp,
      ticketId: qrData,
      status: 'success',
      message: "Entrée autorisée",
      holderName: ticket.holderName
    };
    setScans(prev => [newScan, ...prev]);

    return { success: true, message: "VALIDE", ticket };
  }, [scans, activeEventId]);

  const addEvent = (newEvent: Omit<Event, 'id' | 'status'>) => {
    const event: Event = {
      ...newEvent,
      id: `ev-${Math.random().toString(36).substr(2, 5)}`,
      status: 'upcoming'
    };
    setEvents(prev => [...prev, event]);
    setActiveTab('events');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <ShieldAlert className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">SECURE<span className="text-emerald-400">PASS</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Control Hub</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{activeEvent.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
        {activeTab === 'events' && (
          <EventsView 
            events={events} 
            activeEventId={activeEventId} 
            onSelect={setActiveEventId} 
            onCreate={addEvent} 
          />
        )}
        {activeTab === 'scan' && <ScannerView onScan={handleScanSuccess} eventName={activeEvent.name} />}
        {activeTab === 'stats' && <DashboardView stats={stats} scans={scans.filter(s => s.eventId === activeEventId)} />}
        {activeTab === 'history' && <HistoryView scans={scans.filter(s => s.eventId === activeEventId)} />}
        {activeTab === 'ai' && <SecurityAI stats={stats} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 safe-bottom z-50">
        <NavButton 
          active={activeTab === 'events'} 
          onClick={() => setActiveTab('events')} 
          icon={<Calendar className="w-6 h-6" />} 
          label="Events" 
        />
        <NavButton 
          active={activeTab === 'scan'} 
          onClick={() => setActiveTab('scan')} 
          icon={<Scan className="w-6 h-6" />} 
          label="Scanner" 
        />
        <NavButton 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
          icon={<BarChart3 className="w-6 h-6" />} 
          label="Stats" 
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History className="w-6 h-6" />} 
          label="Historique" 
        />
        <NavButton 
          active={activeTab === 'ai'} 
          onClick={() => setActiveTab('ai')} 
          icon={<MessageSquareCode className="w-6 h-6" />} 
          label="Aide IA" 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    {active && <div className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5"></div>}
  </button>
);

export default App;
