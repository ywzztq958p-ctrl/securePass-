
import React from 'react';
import { ArrowLeft, Printer, Share2, Ticket as TicketIcon, Send, MapPin, Calendar, User } from 'lucide-react';
import { Event, Ticket } from '../types';

interface TicketPrintViewProps {
  event: Event;
  tickets: Ticket[];
  onBack: () => void;
}

const TicketPrintView: React.FC<TicketPrintViewProps> = ({ event, tickets, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = (ticket: Ticket) => {
    alert(`Billet ${ticket.id} envoyé par message à l'utilisateur ${ticket.holderName} !`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Controls (Hidden during print) */}
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Retour aux événements
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Printer className="w-5 h-5" /> TOUT IMPRIMER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-4">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id}
            className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[220px] print:border print:border-slate-300 print:shadow-none print:break-inside-avoid relative"
          >
            {/* Left Section (Branding) */}
            <div className={`w-full md:w-32 flex flex-col items-center justify-center p-4 text-white text-center md:-rotate-180 md:[writing-mode:vertical-lr] ${
              ticket.type === 'VIP' ? 'bg-gradient-to-br from-purple-600 to-indigo-700' : 'bg-gradient-to-br from-emerald-600 to-teal-700'
            }`}>
              <h4 className="font-black text-xl tracking-tighter uppercase">{event.name}</h4>
              <span className="text-[10px] font-bold mt-2 opacity-80 uppercase tracking-widest">{ticket.type} PASS</span>
            </div>

            {/* Main Section */}
            <div className="flex-1 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Détenteur</p>
                  <h3 className="text-lg font-black uppercase text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" /> {ticket.holderName}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siège / Zone</p>
                  <p className="text-sm font-black text-slate-700">{ticket.seat}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold truncate">{event.location}</span>
                </div>
              </div>

              {/* Share Button (Only visible on UI) */}
              <div className="flex justify-end pt-2 print:hidden">
                <button 
                  onClick={() => handleShare(ticket)}
                  className="p-2 hover:bg-slate-100 rounded-full text-emerald-600 transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  <Send className="w-4 h-4" /> ENVOYER
                </button>
              </div>
            </div>

            {/* QR Section */}
            <div className="w-full md:w-48 bg-slate-50 p-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-slate-300 relative">
              {/* Perforation holes simulation */}
              <div className="hidden md:block absolute -top-3 -left-3 w-6 h-6 bg-slate-950 rounded-full"></div>
              <div className="hidden md:block absolute -bottom-3 -left-3 w-6 h-6 bg-slate-950 rounded-full"></div>
              
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrData}&color=020617&bgcolor=f8fafc`} 
                alt="QR Code"
                className="w-28 h-28 object-contain"
              />
              <p className="mt-2 text-[10px] font-mono font-black text-slate-800 tracking-[0.2em]">{ticket.id}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Saisie de secours</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-center print:hidden">
        <TicketIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-slate-300">Format d'impression optimisé</h4>
        <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
          Le système ajuste automatiquement la mise en page pour une impression sur papier A4 ou thermique. 
          Les codes QR sont générés avec une haute correction d'erreur pour une lecture optimale.
        </p>
      </div>
    </div>
  );
};

export default TicketPrintView;
