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
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 2 * 1024 * 1024) {
        alert('MISSION FILE TOO LARGE: Maximum size is 2MB.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('not found')) {
          alert('STORAGE ERROR: The "profiles" bucket was not found in your Supabase storage. Please create a public bucket named "profiles" in your Supabase dashboard.');
        } else {
          alert(`UPLOAD FAILED: ${uploadError.message}`);
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        alert(`PROFILE UPDATE FAILED: ${updateError.message}`);
      } else {
        onUpdate();
      }
    } catch (err: any) { 
      alert(`SYSTEM ERROR: ${err.message}`);
    } finally { 
      setUploading(false); 
    }
  };


  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: fullName, social_links: socials }).eq('id', userId);
    if (!error) { onUpdate(); setIsEditing(false); }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex justify-between items-end px-2">
        <div><h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">YOUR DETAILS</h2><p className="text-[9px] md:text-[11px] font-medium text-slate-500 mt-2">Personal operative record and neural status.</p></div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[9px] md:text-[10px] font-bold text-[#00f2ff] tracking-widest uppercase border-b border-[#00f2ff]/30 pb-1 hover:text-white transition-colors flex items-center space-x-2"><Edit3 size={12} /><span>{isEditing ? 'CANCEL' : 'EDIT'}</span></button>
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
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 md:p-10 flex flex-col items-center relative overflow-hidden text-center">
             <div className="absolute inset-0 bg-gradient-to-t from-[#00f2ff]/5 to-transparent pointer-events-none" />
             <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#00f2ff]/40 p-1 mb-6 relative z-10 shadow-[0_0_40px_rgba(0,242,255,0.1)]"><div className="w-full h-full rounded-full overflow-hidden bg-black"><img src={profile.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} className="w-full h-full object-cover" alt="Avatar" /></div></div>
             <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase relative z-10">{profile.full_name || 'OPERATIVE'}</h3>
             <p className="font-mono text-[#00f2ff] text-[10px] md:text-xs font-bold tracking-[0.3em] mt-2 uppercase relative z-10">RANK: {level} • ELITE COMMANDER</p>
             <div className="w-full mt-10 relative z-10">
                <div className="flex justify-between text-[9px] md:text-[10px] font-mono font-bold text-slate-500 mb-3 uppercase tracking-widest px-1"><span>EXP: {currentLevelXp} / 1000</span><span className="text-[#00f2ff]">{Math.round(progress)}% COMPLETE</span></div>
                <div className="w-full h-3 md:h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 cyber-glow-inner"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff] rounded-full" /></div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Badge icon={<ShieldCheck />} label="Disciplined" detail="7 Day Streak Secured" active={streak >= 7} color="#00f2ff" />
        <Badge icon={<Zap />} label="Persistence Legend" detail="15 Day Streak Secured" active={streak >= 15} color="#ffb800" />
        <Badge icon={<Trophy />} label="Unstoppable" detail="30 Day Streak Secured" active={streak >= 30} color="#ff3e3e" />
        <Badge icon={<Target />} label="High Impact" detail="50 Missions Secured" active={completedTasks >= 50} color="#00ff88" />
        <Badge icon={<Award />} label="Elite Master" detail="Reach Level 10" active={level >= 10} color="#7000ff" />
        <Badge icon={<Globe />} label="Ascended" detail="Reach Level 100" active={level >= 100} color="#fff" />
      </div>
    </div>
  );
}

function Badge({ icon, label, detail, active, color }: any) {
  return (
    <div className={`glass-panel p-4 md:p-5 flex items-center gap-4 md:gap-6 transition-all ${active ? 'opacity-100' : 'opacity-30 grayscale'}`} style={{ borderLeft: active ? `4px solid ${color}` : '4px solid #222' }}>
      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 shrink-0" style={{ color: active ? color : '#666' }}>{React.cloneElement(icon, { size: 22 })}</div>
      <div><span className="text-xs md:text-sm font-black uppercase tracking-widest text-white block leading-none mb-1 truncate max-w-[120px]">{label}</span><span className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-tight">{detail}</span></div>
    </div>
  );
}
