import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { getAnalytics } from '../services/api';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const accuracyData = (data?.accuracyOverTime || []).map((d: any, i: number) => ({
    session: i + 1,
    accuracy: d.accuracy,
    xp: d.xp,
  }));

  const categoryData = (data?.categoryMastery || []).map((d: any) => ({
    subject: d.category,
    mastery: d.avgMastery,
    fullMark: 100,
  }));

  const errorData = Object.entries(data?.errorPatterns || {}).map(([type, count]) => ({
    type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: count as number,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-slate-500 mt-1">Deep insights into your learning performance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-slate-400">Total Sessions</span>
          </div>
          <p className="text-3xl font-bold">{data?.totalSessions || 0}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-slate-400">Weak Areas</span>
          </div>
          <p className="text-3xl font-bold">{data?.weakAreas?.length || 0}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-slate-400">Avg Accuracy</span>
          </div>
          <p className="text-3xl font-bold">
            {accuracyData.length > 0 ? Math.round(accuracyData.reduce((s: number, d: any) => s + d.accuracy, 0) / accuracyData.length) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Over Time */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Accuracy Over Time
          </h3>
          {accuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="session" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          )}
        </div>

        {/* Category Mastery Radar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Category Mastery
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={categoryData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <Radar name="Mastery" dataKey="mastery" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          )}
        </div>

        {/* Error Pattern Analysis */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Mistake Patterns
          </h3>
          {errorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={errorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">No mistakes recorded yet — keep going!</div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Weak Areas
          </h3>
          <div className="space-y-3">
            {(data?.weakAreas || []).length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">No weak areas detected!</div>
            ) : (
              (data?.weakAreas || []).slice(0, 6).map((area: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{area.concept}</p>
                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" style={{ width: `${area.mastery}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-rose-400">{Math.round(area.mastery)}%</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
