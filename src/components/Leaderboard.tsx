import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LeaderboardProps {
  currentUser: {
    name: string;
    level: number;
    xp: number;
    img: string;
  };
}

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10);
      
      if (data) setLeaders(data);
      setLoading(false);
    };

    fetchLeaders();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">LEADERBOARD</h2>
        <span className="label-caps text-cyan-400 text-[10px]">GLOBAL RANKING</span>
      </div>

      {/* Current User Card */}
      <div className="glass-card p-6 border-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-400 overflow-hidden">
               <img src={currentUser.img} className="w-full h-full object-cover" alt="You" />
            </div>
            <div className="absolute -top-2 -right-2 bg-cyan-400 text-black p-1 rounded-md">
              <Crown size={12} strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="label-caps text-cyan-400 text-[10px]">YOUR RANK</p>
            <h3 className="text-2xl font-black text-white uppercase italic">{currentUser.name}</h3>
            <p className="text-xs text-muted font-bold">LEVEL {currentUser.level} • {currentUser.xp} XP</p>
          </div>
        </div>
      </div>

      {/* Real-time List */}
      <div className="flex flex-col gap-4 mt-4">
        <h4 className="label-caps opacity-60 ml-2">WORLD ELITE TOP 10</h4>
        {loading ? (
          <p className="text-center text-muted label-caps animate-pulse py-10">Searching for Pilots...</p>
        ) : (
          leaders.map((leader, idx) => (
            <div key={idx} className="glass-card p-4 flex items-center gap-4" style={{ opacity: leader.xp > 0 ? 1 : 0.5 }}>
              <div className="w-8 h-8 font-black text-xl italic text-muted flex items-center justify-center">
                #{idx + 1}
              </div>
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center">
                 <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.id}`} 
                    className="w-full h-full object-cover opacity-80" 
                    alt="Pilot" 
                 />
              </div>
              <div className="flex-1">
                 <h5 className="font-bold text-white text-sm uppercase tracking-tight truncate max-w-[120px]">
                    {leader.email?.split('@')[0] || 'Unknown Pilot'}
                 </h5>
                 <p className="text-[10px] text-muted font-bold uppercase">Level {leader.level}</p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-black text-white">{Math.floor(leader.xp / 1000)}K</p>
                 <p className="text-[8px] text-muted font-bold uppercase">POINTS</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="glass-card p-6 mt-4 text-center">
         <p className="text-xs text-muted font-bold uppercase italic tracking-widest">Connect to global servers to see live competition.</p>
      </div>
    </div>
  );
}
