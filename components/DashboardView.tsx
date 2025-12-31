
import React from 'react';
import { Users, UserCheck, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SecurityStats, ScanHistory } from '../types';

interface DashboardViewProps {
  stats: SecurityStats;
  scans: ScanHistory[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, scans }) => {
  const progress = (stats.scannedCount / stats.totalExpected) * 100;

  // Prepare chart data from scans (last 6 entries for visualization)
  const chartData = [
    { name: 'VIP', value: stats.vipCount },
    { name: 'STD', value: stats.scannedCount - stats.vipCount },
    { name: 'ERR', value: stats.anomalies },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Tableau de Bord</h2>
          <p className="text-slate-500 text-sm">Aperçu en direct du flux d'entrée</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" /> +12% vs hier
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-400" />} 
          label="Attendus" 
          value={stats.totalExpected.toLocaleString()} 
          color="blue"
        />
        <StatCard 
          icon={<UserCheck className="w-5 h-5 text-emerald-400" />} 
          label="Entrées" 
          value={stats.scannedCount.toLocaleString()} 
          color="emerald"
        />
        <StatCard 
          icon={<Award className="w-5 h-5 text-purple-400" />} 
          label="VIP Scannés" 
          value={stats.vipCount.toLocaleString()} 
          color="purple"
        />
        <StatCard 
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />} 
          label="Anomalies" 
          value={stats.anomalies.toLocaleString()} 
          color="red"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-300">Progression de l'entrée</h3>
          <span className="text-emerald-400 font-black">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-1 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.3)]"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-[10px] uppercase font-bold text-slate-600">
          <span>Ouverture portes</span>
          <span>Saturé (100%)</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-64">
          <h3 className="font-bold text-slate-300 mb-4">Répartition des scans</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#a855f7', '#10b981', '#ef4444'][index % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
          <h3 className="font-bold text-slate-300 mb-4">Derniers alertes</h3>
          <div className="space-y-3">
            {scans.filter(s => s.status !== 'success').slice(0, 3).map(scan => (
              <div key={scan.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border-l-4 border-red-500">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{scan.message}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{scan.timestamp} - ID: {scan.ticketId}</p>
                </div>
              </div>
            ))}
            {scans.filter(s => s.status !== 'success').length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Aucune anomalie critique détectée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/20 bg-blue-500/5",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
    red: "border-red-500/20 bg-red-500/5",
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorMap[color]} flex flex-col gap-2 hover:scale-[1.02] transition-transform`}>
      <div className="bg-slate-900/50 w-fit p-2 rounded-lg border border-slate-800 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardView;
