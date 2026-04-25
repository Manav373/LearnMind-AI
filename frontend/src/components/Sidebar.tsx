import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, Target, Settings, LogOut, Brain, Zap, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/courses', icon: GraduationCap, label: 'Courses' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut({ redirectUrl: '/login' });
  };

  // Calculate level progress as percentage
  const currentLevelXP = user ? Math.pow((user.level - 1), 2) * 100 : 0;
  const nextLevelXP = user ? Math.pow(user.level, 2) * 100 : 100;
  const levelProgress = user ? ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;

  return (
    <aside className="w-72 flex-shrink-0 h-screen sticky top-0 flex flex-col glass border-r border-white/5">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">LearnMind AI</h1>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase">Adaptive Learning</p>
          </div>
        </div>
      </div>

      {/* XP & Level */}
      {user && (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-violet-400">Level {user.level}</span>
            <span className="text-[10px] text-slate-500">{user.xp} XP</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full gradient-primary mastery-bar rounded-full" style={{ width: `${Math.min(100, levelProgress)}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{user.streak} day streak</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
