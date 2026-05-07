'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  TrendingUp, 
  Award, 
  Flame, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  ShieldCheck,
  Zap,
  Target,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateLevel, calculateFinalXp, calculateNewStreak, determineBestMode } from '../lib/gameLogic';
import type { Task, UserProfile } from '../lib/types';
import ChildDetailedView from './ChildDetailedView';
import TaskModal from './TaskModal';

interface ParentDashboardProps {
  parentProfile: UserProfile;
}

export default function ParentDashboard({ parentProfile }: ParentDashboardProps) {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [childTasks, setChildTasks] = useState<Task[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildTasks(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('parent_id', parentProfile.id);
    
    if (data) setChildren(data);
  };

  const fetchChildTasks = async (childId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', childId)
      .order('created_at', { ascending: false });
    
    if (data) setChildTasks(data);
  };

  const connectChild = async () => {
    if (!childEmail) return;
    const { data: childUser, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', childEmail)
      .single();

    if (childUser) {
      await supabase
        .from('profiles')
        .update({ parent_id: parentProfile.id })
        .eq('id', childUser.id);
      
      alert('Neural Link Established Successfully.');
      setChildEmail('');
      fetchChildren();
    } else {
      alert('Child account not found in database.');
    }
  };

  const handleSaveTask = async (taskData: any) => {
    if (!selectedChild) return;
    
    const { error } = await supabase.from('tasks').insert([{
      ...taskData,
      user_id: selectedChild.id,
      assigned_by: parentProfile.id,
      status: 'pending'
    }]);

    if (!error) {
      alert('Mission Deployed to Child Terminal.');
      setIsTaskModalOpen(false);
      fetchChildTasks(selectedChild.id);
    } else {
      console.error('Deployment Error:', error);
      alert('TACTICAL ERROR: Deployment signal lost.');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('TERMINATE MISSION? This action cannot be reversed.')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) {
      alert('Mission Terminated.');
      if (selectedChild) fetchChildTasks(selectedChild.id);
    }
  };

  const updateChildTaskStatus = async (task: Task, newStatus: any) => {
    if (!selectedChild) return;

    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    
    if (!error && newStatus === 'completed') {
      const finalXp = calculateFinalXp(task.xp || 150, selectedChild.mode || 'Builder', selectedChild.streak || 0);
      const newStreak = calculateNewStreak(selectedChild.last_active, selectedChild.streak || 0);
      const now = new Date().toISOString();
      
      const updatedTasks = childTasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t);
      const newMode = determineBestMode(updatedTasks, newStreak);

      const nextXp = (selectedChild.xp || 0) + finalXp;
      const nextLevel = calculateLevel(nextXp);

      await supabase.from('profiles').update({ 
        xp: nextXp,
        level: nextLevel,
        streak: newStreak, 
        last_active: now,
        mode: newMode
      }).eq('id', selectedChild.id);

      // Refresh data
      fetchChildren();
      fetchChildTasks(selectedChild.id);
      setSelectedChild({
        ...selectedChild,
        xp: nextXp,
        level: nextLevel,
        streak: newStreak,
        last_active: now,
        mode: newMode
      });
    } else if (!error) {
      fetchChildTasks(selectedChild.id);
    }
  };

  const updateChildMode = async (newMode: string) => {
    if (!selectedChild) return;
    const { error } = await supabase.from('profiles').update({ mode: newMode }).eq('id', selectedChild.id);
    if (!error) {
      alert(`UNIT MODE OVERRIDE: ${newMode.toUpperCase()} MODE ACTIVE.`);
      // Refresh local children list to show updated mode
      fetchChildren();
      setSelectedChild({ ...selectedChild, mode: newMode });
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">PARENT COMMAND CENTER</h2>
          <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Overseeing Junior Operator Performance</p>
        </div>
        <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-xl p-2">
          <input 
            type="email" 
            placeholder="CHILD EMAIL..." 
            value={childEmail}
            onChange={(e) => setChildEmail(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] font-mono font-bold tracking-widest text-white placeholder-slate-700 px-4 w-48"
          />
          <button 
            onClick={connectChild}
            className="bg-[#00f2ff] text-black text-[10px] font-black px-4 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all uppercase"
          >
            Connect
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Children Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-[#00f2ff] uppercase px-2 mb-4">DEPLOYED UNITS</h3>
          {children.length === 0 ? (
            <div className="glass-panel p-8 text-center border-dashed border-white/10">
              <Users className="mx-auto text-slate-700 mb-4" size={32} />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Children Connected</p>
            </div>
          ) : (
            children.map(child => (
              <motion.div 
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all border-2 ${selectedChild?.id === child.id ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden">
                    <img src={child.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + child.id} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black uppercase tracking-tight text-white">{child.full_name || 'Unit ' + child.id.slice(0, 4)}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-[9px] font-mono font-bold text-[#00f2ff] uppercase tracking-widest">LVL {calculateLevel(child.xp || 0)}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest">{child.streak || 0} DAY STREAK • MODE: {child.mode}</span>
                    </div>
                  </div>
                  <TrendingUp size={16} className="text-slate-600" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Child Detail View */}
        <div className="col-span-12 lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedChild ? (
              <motion.div 
                key={selectedChild.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Command & Control Header */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-black to-[#00f2ff]/5 border-[#00f2ff]/20">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="grid grid-cols-2 gap-8 flex-1">
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Total Growth</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">{selectedChild.xp} XP</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Mission Success</p>
                        <p className="text-4xl font-black italic tracking-tighter text-[#00f2ff]">{childTasks.filter(t => t.status === 'completed').length}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      <button 
                        onClick={() => setIsDetailedViewOpen(true)}
                        className="bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f2ff] hover:text-black transition-all flex items-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>Open Deep Surveillance</span>
                      </button>
                      
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-bold text-[#00f2ff] uppercase tracking-[0.2em] mb-3 text-center">IDENTITY MODE OVERRIDE</p>
                        <div className="flex gap-2">
                          {['Builder', 'Money', 'Monk', 'War'].map(m => (
                            <button 
                              key={m}
                              onClick={() => updateChildMode(m)}
                              className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${selectedChild.mode === m ? 'bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Assignment & List */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">MISSION LOG: {selectedChild.full_name}</h3>
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="flex items-center space-x-2 bg-white/5 hover:bg-[#00f2ff]/10 border border-white/10 hover:border-[#00f2ff]/30 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <Target size={14} className="text-[#00f2ff]" />
                      <span>Assign New Mandate</span>
                    </button>
                  </div>



                  <div className="space-y-3">
                    {childTasks.length === 0 ? (
                      <div className="p-12 text-center glass-panel rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Mission Data Found</p>
                      </div>
                    ) : (
                      childTasks.map(task => (
                        <div key={task.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between border-transparent hover:border-white/10 transition-all group">
                          <div className="flex items-center space-x-5 flex-1">
                            <button 
                              onClick={() => {
                                const next = task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending';
                                updateChildTaskStatus(task, next);
                              }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${task.status === 'completed' ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-500/10 text-slate-500'}`}
                            >
                              {task.status === 'completed' ? <CheckCircle2 size={20} /> : <TrendingUp size={20} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className={`font-bold text-white truncate ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                                {task.assigned_by === parentProfile.id && (
                                  <span className="px-2 py-0.5 bg-[#00f2ff]/10 text-[#00f2ff] text-[8px] font-black uppercase rounded-md border border-[#00f2ff]/20">MANDATED</span>
                                )}
                              </div>
                              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                                STATUS: {task.status.toUpperCase()} • BOUNTY: {task.xp} XP
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 ml-4">
                            {task.status === 'completed' && (task.proof_screenshot_url || task.proof_video_url) && (
                              <div className="flex items-center space-x-2">
                                {task.proof_screenshot_url && (
                                  <div className="relative group/proof">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover/proof:border-[#00f2ff]/50 transition-all">
                                      <img src={task.proof_screenshot_url} alt="Proof" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/proof:opacity-100 flex items-center justify-center transition-all rounded-lg">
                                      <a href={task.proof_screenshot_url} target="_blank" rel="noreferrer" className="text-white">
                                        <Eye size={14} />
                                      </a>
                                    </div>
                                  </div>
                                )}
                                {task.proof_video_url && (
                                  <a 
                                    href={task.proof_video_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 hover:bg-purple-500/20 transition-all"
                                    title="View Video Proof"
                                  >
                                    <Video size={16} />
                                  </a>
                                )}
                              </div>
                            )}
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-2 bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                            >
                              <Plus size={16} className="rotate-45" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-white/5 opacity-50">
                <ShieldCheck size={64} className="text-slate-800 mb-6" />
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">Select Unit for Surveillance</p>
              </div>
            )}
          </AnimatePresence>
          </div>
      </div>

      <AnimatePresence>
        {isDetailedViewOpen && selectedChild && (
          <ChildDetailedView 
            child={selectedChild} 
            tasks={childTasks} 
            parentProfile={parentProfile}
            onRefresh={() => fetchChildTasks(selectedChild.id)}
            onClose={() => setIsDetailedViewOpen(false)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTaskModalOpen && (
          <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={handleSaveTask}
            modules={parentProfile.custom_modules || ['Parental', 'Life', 'Skills']}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
