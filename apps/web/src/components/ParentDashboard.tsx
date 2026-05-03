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
  Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Task, UserProfile } from '../lib/types';

interface ParentDashboardProps {
  parentProfile: UserProfile;
}

export default function ParentDashboard({ parentProfile }: ParentDashboardProps) {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [childTasks, setChildTasks] = useState<Task[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskXp, setNewTaskXp] = useState(150);

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

  const assignTask = async () => {
    if (!selectedChild || !newTaskTitle) return;
    
    const { error } = await supabase.from('tasks').insert([{
      title: newTaskTitle,
      user_id: selectedChild.id,
      xp: newTaskXp,
      status: 'pending',
      assigned_by: parentProfile.id,
      module: 'Parental'
    }]);

    if (!error) {
      alert('Mission Deployed to Child Terminal.');
      setNewTaskTitle('');
      setIsAssigning(false);
      fetchChildTasks(selectedChild.id);
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
                      <span className="text-[9px] font-mono font-bold text-[#00f2ff] uppercase tracking-widest">LVL {child.level || 1}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest">{child.streak || 0} DAY STREAK</span>
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
                {/* Stats Header */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4"><Zap className="text-[#00f2ff]/20" size={120} /></div>
                  <div className="relative z-10 grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Total Growth</p>
                      <p className="text-4xl font-black italic tracking-tighter text-white">{selectedChild.xp} XP</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Mission Success</p>
                      <p className="text-4xl font-black italic tracking-tighter text-[#00f2ff]">{childTasks.filter(t => t.status === 'completed').length}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Neural Status</p>
                      <p className="text-4xl font-black italic tracking-tighter text-orange-500">ACTIVE</p>
                    </div>
                  </div>
                </div>

                {/* Task Assignment & List */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">MISSION LOG: {selectedChild.full_name}</h3>
                    <button 
                      onClick={() => setIsAssigning(!isAssigning)}
                      className="flex items-center space-x-2 bg-white/5 hover:bg-[#00f2ff]/10 border border-white/10 hover:border-[#00f2ff]/30 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <Target size={14} className="text-[#00f2ff]" />
                      <span>Assign New Mandate</span>
                    </button>
                  </div>

                  {isAssigning && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl border-[#00f2ff]/30 space-y-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8">
                          <input 
                            type="text" 
                            placeholder="MISSION TITLE..." 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs outline-none focus:border-[#00f2ff]/50 transition-all font-mono"
                          />
                        </div>
                        <div className="col-span-2">
                          <input 
                            type="number" 
                            value={newTaskXp}
                            onChange={(e) => setNewTaskXp(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs outline-none font-mono"
                          />
                        </div>
                        <div className="col-span-2">
                          <button 
                            onClick={assignTask}
                            className="w-full h-full bg-[#00f2ff] text-black font-black text-[10px] rounded-xl uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            Deploy
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    {childTasks.length === 0 ? (
                      <div className="p-12 text-center glass-panel rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Mission Data Found</p>
                      </div>
                    ) : (
                      childTasks.map(task => (
                        <div key={task.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between border-transparent hover:border-white/10 transition-all group">
                          <div className="flex items-center space-x-5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                              {task.status === 'completed' ? <CheckCircle2 size={18} /> : <TrendingUp size={18} />}
                            </div>
                            <div>
                              <h4 className={`font-bold text-white ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                                STATUS: {task.status.toUpperCase()} • BOUNTY: {task.xp} XP
                                {task.assigned_by === parentProfile.id && <span className="ml-2 text-[#00f2ff]">• ASSIGNED BY YOU</span>}
                              </p>
                            </div>
                          </div>
                          
                          {task.status === 'completed' && (task.proof_screenshot_url || task.proof_video_url) && (
                            <div className="flex items-center space-x-2">
                              {task.proof_screenshot_url && (
                                <a 
                                  href={task.proof_screenshot_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center space-x-2 bg-[#00f2ff]/5 border border-[#00f2ff]/20 px-3 py-1.5 rounded-lg text-[9px] font-bold text-[#00f2ff] uppercase hover:bg-[#00f2ff]/10 transition-all"
                                >
                                  <Eye size={12} />
                                  <span>Inspect Proof</span>
                                </a>
                              )}
                              {task.proof_video_url && (
                                <a 
                                  href={task.proof_video_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center space-x-2 bg-purple-500/5 border border-purple-500/20 px-3 py-1.5 rounded-lg text-[9px] font-bold text-purple-400 uppercase hover:bg-purple-500/10 transition-all"
                                >
                                  <Eye size={12} />
                                  <span>View Video</span>
                                </a>
                              )}
                            </div>
                          )}
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
    </div>
  );
}
