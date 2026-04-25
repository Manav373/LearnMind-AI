import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Award, Trophy, Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOverview, updateSettings } from '../services/api';

const Goals: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOverview().then(res => setOverview(res.data)).catch(console.error);
  }, []);

  const handleSaveGoal = async () => {
    setSaving(true);
    try {
      await updateSettings({ dailyGoal });
      await refreshUser();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const stats = overview?.stats || {};
  const completed = user?.completedToday || 0;
  const goal = user?.dailyGoal || 5;
  const progress = Math.min(100, (completed / goal) * 100);

  // Achievement thresholds
  const achievements = [
    { title: 'First Steps', desc: 'Complete your first learning session', icon: Star, earned: (user?.totalSessions || 0) >= 1, color: 'text-amber-400' },
    { title: 'Quick Learner', desc: 'Reach Level 5', icon: Zap, earned: (user?.level || 0) >= 5, color: 'text-blue-400' },
    { title: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: Trophy, earned: (user?.streak || 0) >= 7, color: 'text-violet-400' },
    { title: 'Mastery Path', desc: 'Master 5 concepts', icon: Award, earned: (stats.mastered || 0) >= 5, color: 'text-emerald-400' },
    { title: 'Century Club', desc: 'Earn 100 XP', icon: Target, earned: (user?.xp || 0) >= 100, color: 'text-rose-400' },
    { title: 'Knowledge Seeker', desc: 'Complete 20 sessions', icon: Star, earned: (user?.totalSessions || 0) >= 20, color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Goals & Achievements</h1>
        <p className="text-slate-500 mt-1">Track your progress and earn rewards.</p>
      </div>

      {/* Daily goal */}
      <div className="glass rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400" /> Daily Learning Goal
        </h3>

        <div className="flex items-center gap-8">
          {/* Ring */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#goalGrad)" strokeWidth="8"
                strokeDasharray={`${progress * 2.64} 264`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }} />
              <defs>
                <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{completed}</span>
              <span className="text-xs text-slate-500">of {goal}</span>
            </div>
          </div>

          {/* Goal setter */}
          <div className="flex-1 space-y-4">
            <p className="text-sm text-slate-300">
              {progress >= 100 ? '🎉 Goal completed! Amazing work!' : `Complete ${goal - completed} more topics to hit your daily goal.`}
            </p>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500">Set daily goal:</label>
              <input type="range" min={1} max={20} value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))}
                className="flex-1 accent-violet-500" />
              <span className="text-sm font-bold w-6 text-center">{dailyGoal}</span>
            </div>
            <button onClick={handleSaveGoal} disabled={saving} className="gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{user?.level || 1}</p>
          <p className="text-xs text-slate-500 mt-1">Level</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{user?.xp || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Total XP</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{user?.streak || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Day Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.mastered || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Mastered</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-5 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                ach.earned ? 'bg-white/[0.03] border-white/10' : 'bg-white/[0.01] border-white/5 opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ach.earned ? `bg-white/10 ${ach.color}` : 'bg-white/5 text-slate-600'}`}>
                <ach.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{ach.title}</p>
                <p className="text-[11px] text-slate-500">{ach.desc}</p>
              </div>
              {ach.earned && <Check className="w-5 h-5 text-emerald-400" />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Goals;
