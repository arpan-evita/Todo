'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Medal, Target, User as UserIcon } from 'lucide-react';
import { calculateLevel } from '../lib/gameLogic';

interface LeaderboardProps {
  currentUser: {
    id: string;
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          xp, 
          level, 
          avatar_url
        `)
        .order('xp', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('LEADERBOARD_FETCH_ERROR:', error);
      }
      
      if (data) {
        setLeaders(data);
      }
    } catch (err) {
      console.error('LEADERBOARD_CRASH:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate accurate rankings handling ties
  let currentRank = 1;
  const rankedLeaders = leaders.map((leader, index) => {
    if (index > 0 && leaders[index - 1].xp !== leader.xp) {
      currentRank = index + 1;
    }
    return { ...leader, rank: currentRank };
  });

  const currentUserData = rankedLeaders.find(l => l.id === currentUser.id);
  const displayRank = currentUserData ? `#${currentUserData.rank}` : '#--';
  const displayPercentile = currentUserData ? `Top ${Math.round((currentUserData.rank / Math.max(leaders.length, 1)) * 100)}%` : 'Top 1%';



  return (
    <div className="space-y-8 pb-20">
      <div className="px-2">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">RANKINGS</h2>
        <p className="text-[9px] md:text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Global Operative Standing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 3 Podium */}
        <div className="lg:col-span-2 space-y-4">
          {leaders.length === 0 && !loading && (
            <div className="glass-panel p-10 rounded-2xl text-center">
              <UserIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No other operatives detected in this sector.</p>
            </div>
          )}
          
          {rankedLeaders.map((leader, index) => (
            <motion.div 
              key={leader.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-[#00f2ff]/30 transition-all ${leader.rank <= 3 ? 'border-l-4 border-l-[#00f2ff]' : ''} ${leader.id === currentUser.id ? 'bg-[#00f2ff]/5 border-[#00f2ff]/30' : ''}`}
            >
              <div className="flex items-center space-x-3 md:space-x-6 shrink-0">
                <div className="w-6 md:w-8 text-center text-sm md:text-xl font-black italic text-slate-700 group-hover:text-[#00f2ff] transition-colors">{leader.rank}</div>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 overflow-hidden shrink-0">
                   <img src={leader.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} className="w-full h-full object-cover" alt="Operative" />
                </div>
                <div>
                   <div className="flex items-center space-x-2">
                     <h4 className="font-bold text-white uppercase tracking-tight">
                       {leader.full_name || `OPERATIVE-${leader.id?.slice(0, 4).toUpperCase()}`}
                     </h4>
                     {leader.id === currentUser.id && <span className="text-[8px] bg-[#00f2ff] text-black px-1.5 py-0.5 rounded font-black">YOU</span>}
                     {/* Badges Display */}
                     <div className="flex items-center space-x-1">
                        {leader.user_achievements?.map((ach: any) => {
                          const iconMap: Record<string, string> = {
                            streak_7: '🔥',
                            streak_15: '⚡',
                            streak_30: '🌀',
                            xp_10k: '💎',
                            ascended: '👑',
                            first_task: '🎯'
                          };
                          return (
                            <span key={ach.achievementId} title={ach.achievementId} className="text-[12px] filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] cursor-help">
                              {iconMap[ach.achievementId] || '🏅'}
                            </span>
                          );
                        })}
                     </div>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Level {calculateLevel(leader.xp)} • {leader.xp.toLocaleString()} XP</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                 {leader.rank === 1 && <Trophy size={20} className="text-yellow-400" />}
                 {leader.rank === 2 && <Medal size={20} className="text-slate-400" />}
                 {leader.rank === 3 && <Medal size={20} className="text-orange-600" />}

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
                   <p className="text-xl font-black">{displayRank}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Percentile</p>
                   <p className="text-xl font-black">{displayPercentile}</p>
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
