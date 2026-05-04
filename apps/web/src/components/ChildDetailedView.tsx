'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Cpu, 
  Zap, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert,
  ArrowLeft,
  Video,
  Eye,
  Clock,
  ExternalLink
} from 'lucide-react';
import { calculateLevel, getIdentity, getPhase } from '../lib/gameLogic';
import type { Task, UserProfile } from '../lib/types';
import AIInsights from './AIInsights';
import Reports from './Reports';
import TaskModal from './TaskModal';
import { supabase } from '../lib/supabase';

interface ChildDetailedViewProps {
  child: UserProfile;
  tasks: Task[];
  onClose: () => void;
  onRefresh?: () => void;
  parentProfile: UserProfile;
}

export default function ChildDetailedView({ child, tasks, onClose, onRefresh, parentProfile }: ChildDetailedViewProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const level = calculateLevel(child.xp || 0);
  const phase = getPhase(level);
  const identity = getIdentity(level);
  const xpInLevel = (child.xp || 0) % 1000;
  const progress = (xpInLevel / 1000) * 100;

  const handleAssignTask = async (taskData: any) => {
    const { error } = await supabase.from('tasks').insert([{
      ...taskData,
      user_id: child.id,
      assigned_by: parentProfile.id,
      status: 'pending'
    }]);

    if (!error) {
      alert('Mission Deployed Successfully.');
      setIsTaskModalOpen(false);
      if (onRefresh) onRefresh();
    } else {
      alert('Failed to deploy mission.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-[100] bg-[#050508] overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 w-full z-10 bg-black/70 backdrop-blur-xl border-b border-white/10 flex justify-between items-center h-20 px-12">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onClose}
            className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
              DEEP SURVEILLANCE: <span className="text-[#00f2ff]">{child.full_name}</span>
            </h2>
            <p className="text-[10px] font-mono font-bold text-slate-500 mt-1 uppercase tracking-widest">
              UNIT ID: {child.id.slice(0, 8)} • MODE: {child.mode}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="hidden md:flex items-center space-x-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f2ff] hover:text-black transition-all"
          >
            <Target size={16} />
            <span>Deploy Mandate</span>
          </button>
          <div className="text-right hidden md:block">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Connection Status</p>
            <p className="text-[10px] font-black text-emerald-500 uppercase">Neural Link Stable</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#00f2ff] p-0.5">
            <img src={child.avatar_url} className="w-full h-full rounded-full object-cover" alt="Unit" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-12 py-12 pb-32 space-y-12">
        {/* AI Insights Sector */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <Cpu size={18} className="text-[#00f2ff]" />
            <h3 className="text-[10px] font-black tracking-[0.3em] text-[#00f2ff] uppercase">NEURAL ANALYTICS</h3>
          </div>
          <AIInsights userId={child.id} />
        </section>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Stats */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Level Card */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-active p-10 rounded-3xl relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-6">
                <span className="px-4 py-1.5 glass-panel rounded-full text-[10px] font-black text-[#00f2ff] tracking-widest uppercase border-[#00f2ff]/30">LEVEL {level}</span>
              </div>
              <div className="flex justify-between items-end mb-10 gap-4 relative z-10">
                <div>
                  <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-2 leading-none text-white">{identity}</h2>
                  <p className="text-[#00f2ff] font-mono text-[12px] font-bold tracking-[0.2em] uppercase">PHASE: {phase.name} • STATUS: OPERATIONAL</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1 leading-none">IDENTITY SHIFT PROGRESS</p>
                  <p className="text-4xl font-black tracking-tight text-white">{Math.round(progress)}%</p>
                </div>
              </div>
              <div className="w-full h-5 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/10 cyber-glow-inner p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#00f2ff] via-[#00f2ff] to-[#7000ff] rounded-full xp-bar-glow"
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                <span>{xpInLevel} / 1000 XP EARNED</span>
                <span className="text-[#00f2ff]">{1000 - xpInLevel} XP TO ASCENSION</span>
              </div>
            </motion.section>

            {/* Detailed Reports */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 px-2">
                <BarChart3 size={18} className="text-purple-500" />
                <h3 className="text-[10px] font-black tracking-[0.3em] text-purple-500 uppercase">OPERATIONAL PERFORMANCE</h3>
              </div>
              <Reports tasks={tasks} />
            </section>
          </div>

          {/* Side Panels */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
            {/* Streak Tracker */}
            <div className="glass-panel p-10 rounded-3xl flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-t from-orange-500/5 to-transparent">
              <div className="w-24 h-24 mb-6 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl" />
                <TrendingUp size={64} className="text-orange-500 relative z-10" />
              </div>
              <h3 className="text-7xl font-black tracking-tighter text-white mb-1">{child.streak || 0}</h3>
              <p className="text-orange-500 text-[11px] font-bold tracking-[0.4em] uppercase mb-6">DAY STREAK ACTIVE</p>
              <div className="w-full h-px bg-white/5 mb-6" />
              <p className="text-slate-500 text-[10px] leading-relaxed italic px-4">
                "Consistency is the ultimate weapon of the Elite Operator."
              </p>
            </div>

            {/* Quick Stats */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Mandates</p>
                  <p className="text-xl font-black text-white">{tasks.length}</p>
               </div>
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secured</p>
                  <p className="text-xl font-black text-green-500">{tasks.filter(t => t.status === 'completed').length}</p>
               </div>
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</p>
                  <p className="text-xl font-black text-[#00f2ff]">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                  </p>
               </div>
            </div>

            {/* Security Alert */}
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-start space-x-4">
               <ShieldAlert className="text-red-500 shrink-0" size={24} />
               <div>
                  <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-1">Surveillance Note</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    You are in high-level surveillance mode. All neural interactions are being logged at the command level.
                  </p>
               </div>
            </div>
          </aside>
        </div>

        {/* New Mission Log Archive Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <Target size={18} className="text-[#00f2ff]" />
              <h3 className="text-[10px] font-black tracking-[0.3em] text-[#00f2ff] uppercase">MISSION LOG ARCHIVE</h3>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#00f2ff]" />
                <span className="text-[9px] font-bold text-slate-500 uppercase">Mandated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase">Secured</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.length === 0 ? (
              <div className="col-span-full py-20 text-center glass-panel rounded-3xl opacity-50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Tactical Data Recorded</p>
              </div>
            ) : (
              tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(task => (
                <motion.div 
                  key={task.id}
                  whileHover={{ y: -5 }}
                  className={`glass-panel p-6 rounded-3xl border-2 transition-all ${task.status === 'completed' ? 'border-green-500/20 bg-green-500/5' : 'border-white/5'} ${task.assigned_by ? 'ring-1 ring-[#00f2ff]/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                      {task.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    {task.assigned_by && (
                      <span className="px-2 py-0.5 bg-[#00f2ff]/10 text-[#00f2ff] text-[8px] font-black uppercase rounded-md border border-[#00f2ff]/20">MANDATED</span>
                    )}
                  </div>

                  <h4 className={`text-sm font-bold text-white mb-2 ${task.status === 'completed' ? 'opacity-60' : ''}`}>{task.title}</h4>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">XP: {task.xp}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">TYPE: {task.type}</span>
                  </div>

                  {task.status === 'completed' && (task.proof_screenshot_url || task.proof_video_url) ? (
                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest mb-2 flex items-center space-x-2">
                        <Eye size={12} />
                        <span>Intelligence Proof</span>
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {task.proof_screenshot_url && (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group/img">
                            <img src={task.proof_screenshot_url} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt="Proof" />
                            <a 
                              href={task.proof_screenshot_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all"
                            >
                              <ExternalLink size={16} className="text-white" />
                            </a>
                          </div>
                        )}
                        {task.proof_video_url && (
                          <a 
                            href={task.proof_video_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="relative aspect-video rounded-xl overflow-hidden border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center group/vid transition-all hover:bg-purple-500/10"
                          >
                            <Video size={20} className="text-purple-500 mb-1" />
                            <span className="text-[8px] font-black text-purple-500 uppercase">Video Feed</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : task.status === 'completed' ? (
                    <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                      <p className="text-[9px] font-bold text-yellow-500/60 uppercase text-center italic">Visual Evidence Missing</p>
                    </div>
                  ) : null}
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isTaskModalOpen && (
          <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={handleAssignTask}
            modules={parentProfile.custom_modules || ['Parental', 'Life', 'Skills']}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
