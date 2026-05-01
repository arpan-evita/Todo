import { motion } from 'framer-motion';
import { Target, Zap, AlertTriangle, Box } from 'lucide-react';
import type { Task } from '../types';

interface ReportsProps {
  tasks: Task[];
}

export default function Reports({ tasks }: ReportsProps) {
  // Neural Stat Calculations
  const totalMissions = tasks.length;
  const completedMissions = tasks.filter(t => t.status === 'done').length;
  const highPrioTasks = tasks.filter(t => t.status !== 'done' && t.priority === 'high').length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  // Combat Readiness Logic
  let readiness = 'OPTIMAL';
  let readinessColor = '#00ff88';
  if (highPrioTasks > 5) {
    readiness = 'CRITICAL';
    readinessColor = '#ff3b30';
  } else if (highPrioTasks > 2) {
    readiness = 'STABILIZING';
    readinessColor = '#ffcc00';
  }

  const INTEL_STATS = [
    { label: 'Completion Rate', value: `${completionRate}%`, color: '#00f2ff', icon: Target },
    { label: 'Combat Readiness', value: readiness, color: readinessColor, icon: Zap },
    { label: 'High Prio Mandates', value: highPrioTasks, color: '#ff3b30', icon: AlertTriangle },
    { label: 'Total Operations', value: totalMissions, color: '#7000ff', icon: Box },
  ];

  const modules = ['SEO', 'Development', 'Strategy', 'Social'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex justify-between items-end mb-2 px-2">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">INTEL REPORT</h2>
          <p className="text-[11px] font-medium text-slate-500 mt-2">Neural tactical analysis of active sector mandates.</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase border-b border-cyan-500/30 pb-1">LATEST_SYNC</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INTEL_STATS.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-8 rounded-2xl relative overflow-hidden group border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={64} style={{ color: stat.color }} />
            </div>
            
            <div className="relative z-10">
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-2" style={{ color: stat.color }}>{stat.label}</p>
              <div className="flex items-end space-x-3">
                <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{stat.value}</h3>
                <div className="w-2 h-2 rounded-full mb-1 animate-pulse shadow-[0_0_10px_currentcolor]" style={{ backgroundColor: stat.color, color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-8 rounded-2xl"
      >
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-1 h-5 bg-cyan-400 rounded-full" />
          <h3 className="text-xs font-mono font-bold text-white tracking-[0.2em] uppercase">Operational Load Distribution</h3>
        </div>
        
        <div className="space-y-8">
          {modules.map((mod, i) => {
            const count = tasks.filter(t => t.module === mod).length;
            const percent = totalMissions > 0 ? (count / totalMissions) * 100 : 0;
            
            return (
              <div key={mod}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">{mod}</span>
                  <span className="text-[10px] font-mono font-bold text-white tracking-widest">{count} MANDATES</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden cyber-glow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent || 2}%` }}
                    transition={{ duration: 1, delay: 0.6 + (i * 0.1) }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
