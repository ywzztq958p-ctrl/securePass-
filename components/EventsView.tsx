
import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Users, Music, Tag, Check, ChevronRight, Printer, Ticket } from 'lucide-react';
import { Event } from '../types';

interface EventsViewProps {
  events: Event[];
  activeEventId: string;
  onSelect: (id: string) => void;
  onCreate: (event: Omit<Event, 'id' | 'status'>, numTickets: number) => void;
  onPrint: (eventId: string) => void;
}

const EventsView: React.FC<EventsViewProps> = ({ events, activeEventId, onSelect, onCreate, onPrint }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    capacity: 0,
    category: 'Concert',
    numTickets: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || formData.capacity <= 0) return;
    const { numTickets, ...eventData } = formData;
    onCreate(eventData, numTickets);
    setShowForm(false);
    setFormData({ name: '', date: '', location: '', capacity: 0, category: 'Concert', numTickets: 10 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Gestion des Événements</h2>
          <p className="text-slate-500 text-sm">Créez et gérez vos billetteries professionnelles</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          {showForm ? 'ANNULER' : <><Plus className="w-4 h-4" /> NOUVEL ÉVÉNEMENT</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nom de l'événement</label>
              <div className="relative">
                <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Ex: Rock en Seine"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lieu</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Ex: Accor Arena"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre de billets à générer</label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Ex: 50"
                  value={formData.numTickets}
                  onChange={e => setFormData({...formData, numTickets: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacité Maximale</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Ex: 15000"
                  value={formData.capacity || ''}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/40 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> CRÉER ÉVÉNEMENT & GÉNÉRER BILLETS
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div 
            key={event.id}
            onClick={() => onSelect(event.id)}
            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 group ${
              activeEventId === event.id 
                ? 'bg-slate-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            {activeEventId === event.id && (
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                <Check className="w-4 h-4" />
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                event.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {event.status === 'active' ? 'EN COURS' : 'À VENIR'}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPrint(event.id);
                }}
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-emerald-400 border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold"
              >
                <Printer className="w-4 h-4" /> BILLETS
              </button>
            </div>

            <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors uppercase">{event.name}</h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <MapPin className="w-3.5 h-3.5" /> {event.location}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Users className="w-3.5 h-3.5" /> {event.capacity.toLocaleString()} max.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{event.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold">ACTIVER</span>
                <ChevronRight className={`w-5 h-5 transition-transform ${activeEventId === event.id ? 'text-emerald-400 translate-x-1' : 'text-slate-700'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsView;
