'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Medal, Target } from 'lucide-react';

interface LeaderboardProps {
  currentUser: {
    name: string;
    level: number;
    xp: number;
    img?: string;
  };
}

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, xp, level, avatar_url')
      .order('xp', { ascending: false })
      .limit(10);
    
    if (data) setLeaders(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="px-2">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">RANKINGS</h2>
        <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Global Operative Standing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 3 Podium */}
        <div className="lg:col-span-2 space-y-4">
          {leaders.map((leader, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-[#00f2ff]/30 transition-all ${index < 3 ? 'border-l-4 border-l-[#00f2ff]' : ''}`}
            >
              <div className="flex items-center space-x-6">
                <div className="w-8 text-center text-xl font-black italic text-slate-700 group-hover:text-[#00f2ff] transition-colors">{index + 1}</div>
                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shrink-0">
                   <img src={leader.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} className="w-full h-full object-cover" alt="Operative" />
                </div>
                <div>
                   <h4 className="font-bold text-white uppercase tracking-tight">{leader.full_name || 'Anonymous Operative'}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Level {leader.level} • {leader.xp.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 {index === 0 && <Trophy size={20} className="text-yellow-400" />}
                 {index === 1 && <Medal size={20} className="text-slate-400" />}
                 {index === 2 && <Medal size={20} className="text-orange-600" />}
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-widest leading-none mb-1">Status</p>
                    <p className="text-xs font-black uppercase text-white">Operational</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current User Card */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel-active p-8 rounded-2xl flex flex-col items-center text-center">
             <div className="w-20 h-20 rounded-full border-4 border-[#00f2ff]/30 p-1 mb-6"><div className="w-full h-full rounded-full overflow-hidden bg-black"><img src={currentUser.img} className="w-full h-full object-cover" alt="You" /></div></div>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">YOUR STANDING</h3>
             <p className="text-[#00f2ff] font-mono text-xs font-bold tracking-[0.2em] uppercase mb-8">LEVEL {currentUser.level} • {currentUser.xp.toLocaleString()} XP</p>
             <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Global Rank</p>
                   <p className="text-xl font-black">#--</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Percentile</p>
                   <p className="text-xl font-black">Top 1%</p>
                </div>
             </div>
          </motion.div>
          
          <div className="glass-panel p-6 rounded-2xl border-dashed border-white/10 flex items-center space-x-6">
             <div className="p-4 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff]"><Target size={24} /></div>
             <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">"Rank up to Elite Commander by completing 5 more High-Priority mandates."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
