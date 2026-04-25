import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, User as UserIcon, Palette, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateSettings } from '../services/api';
import { useUser } from '@clerk/clerk-react';

const Settings: React.FC = () => {
  const { user: appUser, refreshUser } = useAuth();
  const { user: clerkUser } = useUser();
  const [learningStyle, setLearningStyle] = useState<'visual' | 'textual' | 'example'>(appUser?.learningStyle || 'visual');
  const [mentorPersonality, setMentorPersonality] = useState<'friendly' | 'strict' | 'coach'>(appUser?.mentorPersonality || 'friendly');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ learningStyle, mentorPersonality });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const styles = [
    { value: 'visual', label: 'Visual', desc: 'Diagrams, charts, and visual aids' },
    { value: 'textual', label: 'Textual', desc: 'Detailed written explanations' },
    { value: 'example', label: 'Example-Based', desc: 'Learn through practical examples' },
  ];

  const personalities = [
    { value: 'friendly', label: '🤗 Friendly', desc: 'Warm, encouraging, and supportive' },
    { value: 'strict', label: '📐 Strict', desc: 'Direct, precise, and focused' },
    { value: 'coach', label: '🏋️ Coach', desc: 'Motivating and challenging' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500 mt-1">Personalize your learning experience.</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <UserIcon className="w-4 h-4" /> Profile
        </h3>
        <div className="flex items-center gap-4">
          {clerkUser?.imageUrl ? (
            <img src={clerkUser.imageUrl} alt="Profile" className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
          ) : (
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold">
              {appUser?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <p className="font-semibold">{clerkUser?.fullName || appUser?.name}</p>
            <p className="text-sm text-slate-500">{clerkUser?.primaryEmailAddress?.emailAddress || appUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Learning Style */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" /> Learning Style
        </h3>
        <div className="grid gap-3">
          {styles.map(s => (
            <button
              key={s.value}
              onClick={() => setLearningStyle(s.value as any)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                learningStyle === s.value ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${learningStyle === s.value ? 'border-violet-400' : 'border-slate-600'}`}>
                {learningStyle === s.value && <div className="w-2 h-2 rounded-full bg-violet-400" />}
              </div>
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[11px] text-slate-500">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Personality */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-400" /> AI Mentor Personality
        </h3>
        <div className="grid gap-3">
          {personalities.map(p => (
            <button
              key={p.value}
              onClick={() => setMentorPersonality(p.value as any)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                mentorPersonality === p.value ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mentorPersonality === p.value ? 'border-blue-400' : 'border-slate-600'}`}>
                {mentorPersonality === p.value && <div className="w-2 h-2 rounded-full bg-blue-400" />}
              </div>
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-[11px] text-slate-500">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'gradient-primary text-white hover:opacity-90'
        } disabled:opacity-50`}
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </motion.button>
    </div>
  );
};

export default Settings;
