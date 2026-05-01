'use client';

import React, { useState } from 'react';
import { Trophy, Zap, Target, Award, ShieldCheck, Edit3, Upload, Globe, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../lib/types';

interface LevelBoardProps {
  xp: number;
  level: number;
  streak: number;
  tasks: Task[];
  profile: any;
  onUpdate: () => void;
  userId: string;
}

export default function LevelBoard({ xp, level, streak, tasks, profile, onUpdate, userId }: LevelBoardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [socials, setSocials] = useState(profile.social_links || {});
  const [uploading, setUploading] = useState(false);

  const currentLevelXp = xp % 1000;
  const progress = (currentLevelXp / 1000) * 100;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      const filePath = `avatars/${userId}-${Math.random()}.${file.name.split('.').pop()}`;

      await supabase.storage.from('profiles').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
      onUpdate();
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: fullName, social_links: socials }).eq('id', userId);
    if (!error) { onUpdate(); setIsEditing(false); }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex justify-between items-end px-2">
        <div><h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">YOUR DETAILS</h2><p className="text-[11px] font-medium text-slate-500 mt-2">Personal operative record and neural status.</p></div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-bold text-[#00f2ff] tracking-widest uppercase border-b border-[#00f2ff]/30 pb-1 hover:text-white transition-colors flex items-center space-x-2"><Edit3 size={12} /><span>{isEditing ? 'CANCEL' : 'EDIT PROFILE'}</span></button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 rounded-2xl space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#00f2ff]/30 relative overflow-hidden group">
                 <img src={profile.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} className="w-full h-full object-cover" alt="Avatar" />
                 <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity"><Upload size={20} className="text-white mb-1" /><span className="text-[8px] font-bold text-white uppercase">{uploading ? '...' : 'UPLOAD'}<input type="file" className="hidden" onChange={handleAvatarUpload} /></span></label>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Display Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#00f2ff]/50 transition-all" /></div>
              <button onClick={saveProfile} className="w-full py-4 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] flex items-center justify-center space-x-2"><Save size={16} /><span>SYNCHRONIZE IDENTITY</span></button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 flex flex-col items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-[#00f2ff]/5 to-transparent pointer-events-none" />
             <div className="w-28 h-28 rounded-full border-4 border-[#00f2ff]/40 p-1 mb-6 relative z-10 shadow-[0_0_40px_rgba(0,242,255,0.1)]"><div className="w-full h-full rounded-full overflow-hidden bg-black"><img src={profile.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} className="w-full h-full object-cover" alt="Avatar" /></div></div>
             <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase relative z-10">{profile.full_name || 'OPERATIVE'}</h3>
             <p className="font-mono text-[#00f2ff] text-xs font-bold tracking-[0.3em] mt-2 uppercase relative z-10">RANK: {level} • ELITE COMMANDER</p>
             <div className="w-full mt-10 relative z-10">
                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mb-3 uppercase tracking-widest px-1"><span>EXP: {currentLevelXp} / 1000</span><span className="text-[#00f2ff]">{Math.round(progress)}% COMPLETE</span></div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 cyber-glow-inner"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff] rounded-full" /></div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div className={`glass-panel p-5 flex items-center gap-6 transition-all ${active ? 'opacity-100' : 'opacity-30 grayscale'}`} style={{ borderLeft: active ? `4px solid ${color}` : '4px solid #222' }}>
      <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10" style={{ color: active ? color : '#666' }}>{React.cloneElement(icon, { size: 28 })}</div>
      <div><span className="text-sm font-black uppercase tracking-widest text-white block leading-none mb-1">{label}</span><span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{detail}</span></div>
    </div>
  );
}
