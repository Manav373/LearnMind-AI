import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Zap, TrendingUp, BookOpen, RotateCcw, Sparkles, ChevronRight, Clock, Award, GraduationCap, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOverview, getRecommendations, getMyCourses } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [overviewRes, recsRes, coursesRes] = await Promise.all([
          getOverview(), 
          getRecommendations(),
          getMyCourses()
        ]);
        setOverview(overviewRes.data);
        setRecommendations(recsRes.data.recommendations || []);
        setMyCourses(coursesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const stats = overview?.stats || {};
  const progress = overview?.progress || [];

  const statCards = [
    { label: 'Overall Mastery', value: `${stats.avgMastery || 0}%`, icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Concepts Mastered', value: `${stats.mastered || 0}/${stats.totalConcepts || 0}`, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Learning Streak', value: `${user?.streak || 0} days`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'XP Earned', value: `${user?.xp || 0}`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'review': return <RotateCcw className="w-4 h-4" />;
      case 'new': return <Sparkles className="w-4 h-4" />;
      case 'strengthen': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'review': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'new': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'strengthen': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-400';
    if (score >= 50) return 'from-amber-500 to-amber-400';
    return 'from-rose-500 to-rose-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name || 'Learner'}</span>
        </h1>
        <p className="text-slate-500 mt-1">Your adaptive learning path is optimized for today.</p>
      </div>

      {/* Resume Learning Popup */}
      <AnimatePresence>
        {user?.lastWatchedVideo && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group overflow-hidden glass rounded-3xl p-1 border border-violet-500/30 shadow-2xl shadow-violet-500/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 p-5">
              <div className="relative w-full md:w-48 aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/5">
                <img src={user.lastWatchedVideo.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Resume" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                  {Math.floor(user.lastWatchedVideo.timestamp / 60)}:{(user.lastWatchedVideo.timestamp % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-violet-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ready to continue?</span>
                </div>
                <h3 className="text-xl font-bold line-clamp-1">{user.lastWatchedVideo.title}</h3>
                <p className="text-sm text-slate-500">Pick up exactly where you left off and master this topic.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => user?.lastWatchedVideo && navigate(`/player/${user.lastWatchedVideo.videoId}`, { state: { video: user.lastWatchedVideo } })}
                  className="gradient-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-violet-500/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Resume Now
                </button>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all">
                  Later
                </button>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 glass-hover transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Progress */}
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Today's Progress
          </h3>
          <div className="text-center space-y-4">
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGrad)" strokeWidth="8"
                  strokeDasharray={`${((user?.completedToday || 0) / (user?.dailyGoal || 5)) * 264} 264`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{user?.completedToday || 0}</span>
                <span className="text-[10px] text-slate-500">of {user?.dailyGoal || 5}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400">Daily Goal</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" /> Smart Recommendations
          </h3>
          <div className="space-y-2.5">
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-600 py-8 text-center">Start learning to get personalized recommendations!</p>
            ) : (
              recommendations.slice(0, 5).map((rec, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/learn?concept=${rec.conceptId}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getRecommendationColor(rec.type)}`}>
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rec.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{rec.reason}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-400" /> My Enrolled Courses
          </h3>
          <button onClick={() => navigate('/courses')} className="text-xs text-violet-400 hover:underline">Browse All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myCourses.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-slate-500">You haven't enrolled in any courses yet.</p>
              <button onClick={() => navigate('/courses')} className="mt-2 text-xs font-bold text-violet-400">Find a course →</button>
            </div>
          ) : (
            myCourses.map((course) => (
              <div key={course._id} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={() => navigate(`/learn?concept=${course.concepts[0]?._id}`)}>
                <img src={course.thumbnail} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-violet-400 transition-colors">{course.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 uppercase">{course.level}</span>
                    <span className="text-[10px] text-slate-600">{course.concepts?.length || 0} Topics</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 self-center group-hover:text-slate-300" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Knowledge Graph */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-5 flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" /> Knowledge Mastery
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {progress.map((p: any) => {
            const concept = p.conceptId;
            const score = p.masteryScore || 0;
            return (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/learn?concept=${concept?._id || p.conceptId}`)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all border border-transparent hover:border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{concept?.name || 'Unknown'}</p>
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${getMasteryColor(score)} mastery-bar`} style={{ width: `${score}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 flex-shrink-0">{Math.round(score)}%</span>
              </motion.div>
            );
          })}
          {progress.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-600 text-sm">
              No progress yet. Start a learning session to begin tracking!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
