import React from 'react';
import { Trophy, Zap, Target, Award, ShieldCheck } from 'lucide-react';
import type { Task } from '../types';

interface LevelBoardProps {
  xp: number;
  level: number;
  streak: number;
  tasks: Task[];
}

export default function LevelBoard({ xp, level, streak, tasks }: LevelBoardProps) {
  const nextLevelXp = 15000;
  const currentXp = xp % nextLevelXp;
  const progress = (currentXp / nextLevelXp) * 100;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">LEVEL BOARD</h2>
        <span className="label-caps text-purple-400 text-[10px]">ELITE STATUS</span>
      </div>

      <div className="glass-card p-10 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full bg-zinc-900 border-4 border-purple-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(112,0,255,0.4)]">
           <Trophy size={56} className="text-purple-400" />
        </div>
        <h3 className="text-5xl font-black text-white italic tracking-widest uppercase">RANK: {level}</h3>
        <p className="label-caps text-purple-400 mt-2 text-sm">Cyber Knight Guardian</p>
        
        <div className="w-full mt-10">
           <div className="flex justify-between text-[11px] font-black text-muted mb-3 uppercase tracking-widest">
              <span>EXP: {currentXp}</span>
              <span>GOAL: {nextLevelXp}</span>
           </div>
           <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-1">
              <div className="h-full bg-gradient-to-r from-purple-600 via-cyan-400 to-purple-600 animate-pulse rounded-full" style={{ width: `${progress || 5}%` }}></div>
           </div>
        </div>
      </div>

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
    <div className="glass-card p-5 flex items-center gap-6" style={{ opacity: active ? 1 : 0.3, borderLeft: active ? `4px solid ${color}` : '4px solid #222' }}>
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10" style={{ color: active ? color : '#666', boxShadow: active ? `0 0 20px ${color}33` : 'none' }}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <span className="text-sm font-black uppercase tracking-widest text-white block">{label}</span>
        <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">{detail}</span>
      </div>
      {active && (
        <div className="ml-auto w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
           <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
        </div>
      )}
    </div>
  );
}
