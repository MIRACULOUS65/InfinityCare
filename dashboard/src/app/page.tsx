'use client';

import React, { useEffect, useState } from 'react';
import {
  Heart,
  Activity,
  Wind,
  Thermometer,
  Clock,
  AlertCircle,
  LayoutDashboard,
  History,
  User
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await fetch('/api/v1/vitals/ingest');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to fetch vitals');
      }
    };

    fetchVitals();
    const interval = setInterval(fetchVitals, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const latest = data?.latest;
  const history = data?.history || [];

  const chartData = history.map((h: any) => ({
    time: new Date(h.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heartRate: h.heartRate,
    oxygen: h.oxygenSaturation,
    respiration: h.respirationRate,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            InfiniteCare Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">Dr. Presage</span>
            <span className="text-xs text-slate-500">Administrator</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <nav className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20 font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-xl transition-colors font-medium">
            <History size={20} /> Session History
          </button>
        </nav>

        {/* Dashboard Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Latest Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Heart Rate"
              value={latest?.heartRate || '--'}
              unit="BPM"
              icon={<Heart className="text-rose-500" />}
              color="rose"
            />
            <StatCard
              label="SpO2"
              value={latest?.oxygenSaturation || '--'}
              unit="%"
              icon={<Activity className="text-cyan-500" />}
              color="cyan"
            />
            <StatCard
              label="Respiration"
              value={latest?.respirationRate || '--'}
              unit="RPM"
              icon={<Wind className="text-emerald-500" />}
              color="emerald"
            />
          </div>

          {/* Graph Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Vitals Trend</h2>
              <div className="flex gap-4">
                <LegendItem color="#f43f5e" label="HR" />
                <LegendItem color="#06b6d4" label="SpO2" />
                <LegendItem color="#10b981" label="Resp" />
              </div>
            </div>
            <div className="w-full h-full pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="oxygen" stroke="#06b6d4" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="respiration" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold">Recent Measurements</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">HR</th>
                    <th className="px-6 py-3">SpO2</th>
                    <th className="px-6 py-3">Resp</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.slice().reverse().map((entry: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        {new Date(entry.receivedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 font-medium">{entry.heartRate} bpm</td>
                      <td className="px-6 py-4 font-medium">{entry.oxygenSaturation}%</td>
                      <td className="px-6 py-4 font-medium">{entry.respirationRate} rpm</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          Complete
                        </span>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No data recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, unit, icon, color }: any) {
  const colors: any = {
    rose: "bg-rose-500/10 border-rose-500/20",
    cyan: "bg-cyan-500/10 border-cyan-500/20",
    emerald: "bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 font-medium">{label}</span>
        <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums">{value}</span>
        <span className="text-slate-500 font-medium uppercase text-sm">{unit}</span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm text-slate-400 font-medium">{label}</span>
    </div>
  );
}
