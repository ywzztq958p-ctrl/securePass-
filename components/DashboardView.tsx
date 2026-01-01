
import React, { useMemo } from 'react';
import { Users, UserCheck, ShieldAlert, Award, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { SecurityStats, ScanHistory } from '../types';

interface DashboardViewProps {
  stats: SecurityStats;
  scans: ScanHistory[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, scans }) => {
  const progress = (stats.scannedCount / stats.totalExpected) * 100;

  // Flux d'entrée par minute (simulation basée sur les timestamps réels)
  const flowData = useMemo(() => {
    const successScans = scans.filter(s => s.status === 'success');
    // On groupe par périodes de 5 minutes pour la lisibilité
    return [
      { time: 'T-20', count: Math.floor(stats.scannedCount * 0.15) },
      { time: 'T-15', count: Math.floor(stats.scannedCount * 0.25) },
      { time: 'T-10', count: Math.floor(stats.scannedCount * 0.45) },
      { time: 'T-5', count: Math.floor(stats.scannedCount * 0.75) },
      { time: 'NOW', count: stats.scannedCount },
    ];
  }, [scans, stats.scannedCount]);

  const chartData = [
    { name: 'VIP', value: stats.vipCount },
    { name: 'Standard', value: stats.scannedCount - stats.vipCount },
    { name: 'Rejetés', value: stats.anomalies },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Monitoring Live</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Flux d'accès en temps réel</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-500/20 shadow-lg shadow-emerald-950/20">
            <Activity className="w-3 h-3" /> Système Nominal
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Capacité" value={stats.totalExpected.toLocaleString()} color="blue" />
        <StatCard icon={<UserCheck className="w-5 h-5 text-emerald-400" />} label="Entrées" value={stats.scannedCount.toLocaleString()} color="emerald" />
        <StatCard icon={<Award className="w-5 h-5 text-purple-400" />} label="Pass VIP" value={stats.vipCount.toLocaleString()} color="purple" />
        <StatCard icon={<ShieldAlert className="w-5 h-5 text-red-500" />} label="Alertes" value={stats.anomalies.toLocaleString()} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Flow Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-300 uppercase text-xs tracking-widest">Taux d'occupation</h3>
              <span className="text-emerald-400 font-black text-2xl">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-6 overflow-hidden p-1.5 shadow-inner border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                style={{ width: `${Math.max(progress, 2)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 h-80 shadow-2xl">
            <h3 className="font-black text-slate-300 uppercase text-xs tracking-widest mb-6">Dynamique d'entrée (5min)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Charts/Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 h-64 shadow-2xl">
            <h3 className="font-black text-slate-300 uppercase text-xs tracking-widest mb-6">Répartition</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={70} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#a855f7', '#10b981', '#ef4444'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-[2.5rem] shadow-2xl">
            <h3 className="font-black text-red-500 uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Alertes Critiques
            </h3>
            <div className="space-y-3">
              {scans.filter(s => s.status === 'error').slice(0, 2).map(scan => (
                <div key={scan.id} className="p-3 bg-red-950/20 rounded-2xl border border-red-500/10">
                  <p className="text-xs font-black text-red-400 uppercase">{scan.message}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">{scan.timestamp} - {scan.ticketId}</p>
                </div>
              ))}
              {scans.filter(s => s.status === 'error').length === 0 && (
                <p className="text-center py-4 text-slate-600 text-[10px] font-bold uppercase">Aucune menace active</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const colorStyles: Record<string, string> = {
    blue: "from-blue-500/20 to-transparent border-blue-500/20 text-blue-400",
    emerald: "from-emerald-500/20 to-transparent border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/20 to-transparent border-purple-500/20 text-purple-400",
    red: "from-red-500/20 to-transparent border-red-500/20 text-red-500",
  };

  return (
    <div className={`p-6 rounded-[2rem] border bg-gradient-to-b ${colorStyles[color]} shadow-xl transition-all hover:translate-y-[-4px]`}>
      <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardView;
