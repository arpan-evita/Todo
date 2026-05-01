import React, { useState } from 'react';
import { Trophy, Zap, Target, Award, ShieldCheck, Edit3, Upload, Globe, Save, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../types';

interface LevelBoardProps {
  xp: number;
  level: number;
  streak: number;
  tasks: Task[];
  profile: {
    full_name: string;
    avatar_url: string;
    social_links: any;
    custom_modules: string[];
  };
  onUpdate: () => void;
  userId: string;
}

const Github = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const Linkedin = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function LevelBoard({ xp, level, streak, tasks, profile, onUpdate, userId }: LevelBoardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [socials, setSocials] = useState(profile.social_links);
  const [uploading, setUploading] = useState(false);

  const nextLevelXp = 5000;
  const currentXp = xp % nextLevelXp;
  const progress = (currentXp / nextLevelXp) * 100;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
      onUpdate();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Avatar Upload Failed: Ensure "profiles" bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName,
        social_links: socials,
        custom_modules: modules
      })
      .eq('id', userId);

    if (!error) {
      onUpdate();
      setIsEditing(false);
    }
  };

  const removeModule = (m: string) => {
    // Migrated to Settings
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex justify-between items-end mb-2 px-2">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">YOUR DETAILS</h2>
          <p className="text-[11px] font-medium text-slate-500 mt-2">Personal operative record and neural status.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 text-[10px] font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase border-b border-cyan-500/30 pb-1 hover:text-white transition-colors"
        >
          <Edit3 size={12} />
          <span>{isEditing ? 'CANCEL' : 'EDIT PROFILE'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-8 rounded-2xl space-y-6"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-cyan-500/30 flex items-center justify-center relative group overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <Trophy size={40} className="text-slate-700" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                  <Upload size={20} className="text-white mb-1" />
                  <span className="text-[8px] font-bold text-white uppercase">{uploading ? '...' : 'UPLOAD'}</span>
                  <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">DISPLAY NAME</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Operative Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center"><Github size={12} className="mr-2" /> GITHUB</label>
                  <input 
                    type="text" 
                    value={socials.github || ''}
                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center"><Linkedin size={12} className="mr-2" /> LINKEDIN</label>
                  <input 
                    type="text" 
                    value={socials.linkedin || ''}
                    onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white text-xs"
                  />
                </div>
              </div>

              <button 
                onClick={saveProfile}
                className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>SYNCHRONIZE IDENTITY</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 flex flex-col items-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
            
            <div className="w-28 h-28 rounded-full bg-zinc-900 border-4 border-cyan-500/40 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,242,255,0.2)] relative z-10 overflow-hidden">
               {profile.avatar_url ? (
                 <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
               ) : (
                 <Trophy size={56} className="text-cyan-400" />
               )}
            </div>

            <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase relative z-10">
              {profile.full_name || 'OPERATIVE'}
            </h3>
            <p className="font-mono text-cyan-400 text-xs font-bold tracking-[0.3em] mt-2 uppercase relative z-10">
              RANK: {level} • ELITE COMMANDER
            </p>

            <div className="flex space-x-4 mt-6 relative z-10">
              {socials.github && <a href={socials.github} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Github size={18} /></a>}
              {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Linkedin size={18} /></a>}
              {socials.portfolio && <a href={socials.portfolio} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Globe size={18} /></a>}
            </div>
            
            <div className="w-full mt-10 relative z-10">
               <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mb-3 uppercase tracking-widest px-1">
                  <span>EXP: {currentXp}</span>
                  <span className="text-cyan-400">{Math.round(progress)}% COMPLETE</span>
               </div>
               <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 cyber-glow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress || 5}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 rounded-full" 
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        <Badge icon={<ShieldCheck />} label="Disciplined" detail="7 Day Streak Required" active={streak >= 7} color="#00f2ff" />
        <Badge icon={<Zap />} label="High Energy" detail="10 Missions Secured" active={completedTasks >= 10} color="#ffb800" />
        <Badge icon={<Target />} label="Goal Getter" detail="20 Missions Secured" active={completedTasks >= 20} color="#00ff88" />
        <Badge icon={<Award />} label="Elite Master" detail="Reach Rank 5" active={level >= 5} color="#7000ff" />
      </div>
    </div>
  );
}

function Badge({ icon, label, detail, active, color }: any) {
  return (
    <div className="glass-panel p-5 flex items-center gap-6" style={{ opacity: active ? 1 : 0.3, borderLeft: active ? `4px solid ${color}` : '4px solid #222' }}>
      <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10" style={{ color: active ? color : '#666', boxShadow: active ? `0 0 20px ${color}33` : 'none' }}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <span className="text-sm font-black uppercase tracking-widest text-white block leading-none mb-1">{label}</span>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{detail}</span>
      </div>
      {active && (
        <div className="ml-auto w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
           <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
        </div>
      )}
    </div>
  );
}
