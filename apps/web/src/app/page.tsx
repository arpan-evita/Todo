'use client';



import { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  LayoutGrid, 
  Trophy, 
  User, 
  BarChart3, 
  Power, 
  Check, 
  MoreVertical, 
  Flame, 
  Bolt, 
  Cloud,
  Cpu,
  ExternalLink,
  Info,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { calculateLevel, getIdentity, getPhase, calculateFinalXp, checkStreakAndPenalties } from '../lib/gameLogic';
import { checkNewAchievements } from '../lib/achievements';
import type { Task, Status } from '../lib/types';
import { initNotifications, sendNotification } from '../lib/notifications';
import { logActivity } from '../lib/activity';

import TaskModal from '../components/TaskModal';
import ProofModal from '../components/ProofModal';
import ParentDashboard from '../components/ParentDashboard';
import Leaderboard from '../components/Leaderboard';
import Reports from '../components/Reports';
import LevelBoard from '../components/LevelBoard';
import Login from '../components/Login';
import AIInsights from '../components/AIInsights';
import AICoach from '../components/AICoach';



const PILOT_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuAh40g38_asydALJucbCa8FKAn_yk3LmmWOCj_t4mEtMW0xziM3cocNSjd-naohafI7akNLwzINnSboGd8BdzW_us1r3PoOwfBFcjMshG_67MrEPOUYCpZyagfMkJ6qwx45AKwHiIZGEQFPgLCrvzHpl6HhOdnfu14wjfgyFtXT7cuXAhETVHPfj-2LXxyE3HFrFyAwNg6rjE6LMETh4TSO6UEXsNwSIIUfCFKeP6_SPJD_1u8knrUFj021u-wo2Ij12j1wpT0JXS2a";

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'board' | 'levels' | 'reports' | 'profile' | 'settings' | 'parent'>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [profile, setProfile] = useState<any>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [taskPendingCompletion, setTaskPendingCompletion] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTaskIdMenu, setActiveTaskIdMenu] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; msg: string; type: 'info' | 'warn' }[]>([]);

  const addNotification = (msg: string, type: 'info' | 'warn' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) logActivity(session.user.id, 'login', { user_agent: navigator.userAgent });
      setLoading(false);
    };

    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      initialize();
      initNotifications(); // Request permissions for Web/APK
    }
  }, [session]);

  const initialize = async () => {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profileData) {
      // Check for penalties
      const { newStreak, penaltyXp, status } = checkStreakAndPenalties(profileData.last_active, profileData.xp || 0, profileData.streak || 0);
      
      let finalXp = profileData.xp || 0;
      let finalStreak = profileData.streak || 0;

      if (status === 'broken' || status === 'reset') {
        finalXp = Math.max(0, finalXp - penaltyXp);
        finalStreak = newStreak;
        await supabase.from('profiles').update({ 
          xp: finalXp, 
          streak: finalStreak,
          last_active: new Date().toISOString() 
        }).eq('id', session.user.id);
        alert(`SYSTEM ALERT: Neural connection downtime detected. Penalty: -${penaltyXp} XP. Streak Reset.`);
      }

      setXp(finalXp);
      setLevel(calculateLevel(finalXp));
      setStreak(finalStreak);
      setProfile(profileData);
      fetchTasks();

      // Check for alerts
      const xpToNext = 1000 - (finalXp % 1000);
      if (xpToNext < 200) addNotification(`CRITICAL: ${xpToNext} XP remaining for Identity Shift.`, 'info');
      
      const lastActiveDate = new Date(profileData.last_active);
      const isToday = lastActiveDate.toDateString() === new Date().toDateString();
      if (!isToday && finalStreak > 0) addNotification("STREAK ALERT: Mission deployment required to maintain neural link.", 'warn');
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('FETCH_TASKS_ERROR:', error);
    }
    
    if (data) {
      setTasks(data);
    }
  };

  const updateTaskStatus = async (task: Task, newStatus: Status, proofData?: { screenshotUrl: string; videoUrl: string }) => {
    const oldStatus = task.status;
    const updatePayload: any = { 
      status: newStatus, 
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null 
    };

    if (proofData) {
      updatePayload.proof_screenshot_url = proofData.screenshotUrl;
      updatePayload.proof_video_url = proofData.videoUrl;
    }

    const { error } = await supabase.from('tasks').update(updatePayload).eq('id', task.id);
    
    if (!error) {
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        const finalXp = calculateFinalXp(task.xp || 150, profile.mode || 'Builder', streak);
        grantXp(finalXp);
        sendNotification('MISSION ACCOMPLISHED', `Mandate "${task.title}" secured. +${finalXp} XP acquired.`);
        logActivity(session.user.id, 'task_completed', { 
          task_id: task.id, 
          title: task.title, 
          xp_earned: finalXp,
          proof: proofData 
        });
      } else if (oldStatus === 'completed' && newStatus !== 'completed') {
        const finalXp = calculateFinalXp(task.xp || 150, profile.mode || 'Builder', streak);
        grantXp(-finalXp);
      }
      fetchTasks();
    }
  };

  const grantXp = async (amount: number) => {
    const newXp = Math.max(0, xp + amount);
    const newLevel = calculateLevel(newXp);
    setXp(newXp);
    setLevel(newLevel);
    await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', session.user.id);
    
    // Check Achievements
    const { data: achievements } = await supabase.from('user_achievements').select('achievementId').eq('userId', session.user.id);
    const existingIds = (achievements || []).map(a => a.achievementId);
    const newAchievements = checkNewAchievements({ xp: newXp, streak, completedCount: tasks.filter(t => t.status === 'completed').length }, existingIds);
    
    if (newAchievements.length > 0) {
      for (const ach of newAchievements) {
        await supabase.from('user_achievements').insert([{ userId: session.user.id, achievementId: ach.id }]);
        alert(`MISSION ACCOMPLISHED: Unlocked "${ach.title}"!`);
        sendNotification('NEW ACHIEVEMENT UNLOCKED', `You have been awarded the "${ach.title}" medal.`);
      }
    }
  };

  const handleSaveTask = async (taskData: any) => {
    if (editingTask) {
      const { error } = await supabase.from('tasks').update({
        title: taskData.title,
        description: taskData.description,
        xp: taskData.xp,
        due_date: taskData.due_date,
        status: taskData.status || editingTask.status,
      }).eq('id', editingTask.id);
      if (error) {
        console.error('TASK_UPDATE_ERROR:', error);
        alert(`MISSION FAILED: ${error.message}`);
      }
    } else {
      const { data, error } = await supabase.from('tasks').insert([{ 
        title: taskData.title,
        description: taskData.description,
        xp: taskData.xp,
        due_date: taskData.due_date,
        user_id: session.user.id,
        status: 'pending'
      }]).select().single();
      
      if (error) {
        console.error('TASK_INSERT_ERROR:', error);
        alert(`MISSION FAILED: ${error.message}`);
      } else if (data) {
        logActivity(session.user.id, 'task_created', { task_id: data.id, title: data.title });
      }
    }
    fetchTasks();

    setIsModalOpen(false);
    setEditingTask(null);
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Terminate mission?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  if (loading) return <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center space-y-4"><Cpu className="animate-pulse text-[#00f2ff]" size={48} /><p className="text-[10px] font-mono font-bold text-[#00f2ff] tracking-[0.3em] uppercase">Initializing Neural Link...</p></div>;
  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-[#00f2ff]/30">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 flex justify-between items-center h-16 px-8">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#7000ff] tracking-tighter uppercase italic">AUTOGROWX: MISSION CONTROL</div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-96 group hover:border-[#00f2ff]/50 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 group-hover:text-[#00f2ff]" /><input placeholder="QUERY MISSION DATABASE..." className="bg-transparent border-none outline-none text-[10px] font-mono font-bold tracking-widest text-white placeholder-slate-500 w-full" />
          </div>
          <button className="text-slate-400 hover:text-[#00f2ff] relative"><Bell size={20} /><span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" /></button>
          <div className="w-10 h-10 rounded-full border border-[#00f2ff]/50 overflow-hidden hover:ring-2 hover:ring-[#00f2ff]/50 cursor-pointer" onClick={() => setActiveTab('profile')}>
            <img src={profile.avatar_url || PILOT_IMG} className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav 
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] z-40 bg-black/80 backdrop-blur-2xl border-r border-[#00f2ff]/10 transition-all duration-500 flex flex-col py-6 ${isSidebarHovered ? 'w-64' : 'w-20'}`}
        onMouseEnter={() => setIsSidebarHovered(true)} onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="px-6 mb-8 flex items-center space-x-4">
           <div className="w-10 h-10 rounded bg-gradient-to-br from-[#00f2ff] to-[#7000ff] flex items-center justify-center shrink-0"><Cpu size={20} className="text-black" /></div>
           {isSidebarHovered && <div><p className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-widest leading-none mb-1">COMMANDER</p><p className="text-xs font-bold uppercase">{getIdentity(level)}</p></div>}
        </div>
        <div className="flex-1 space-y-2">
          {[
            { id: 'board', icon: LayoutGrid, label: 'Dashboard' },
            { id: 'parent', icon: ShieldCheck, label: 'Parent Control' },
            { id: 'levels', icon: Trophy, label: 'Leaderboard' },
            { id: 'reports', icon: BarChart3, label: 'Intel Report' },
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center h-12 px-6 cursor-pointer transition-all relative ${activeTab === item.id ? 'text-[#00f2ff] border-l-4 border-[#00f2ff] bg-[#00f2ff]/10' : 'text-slate-500 hover:bg-white/10'}`}>
              <item.icon size={24} className="shrink-0" />
              {isSidebarHovered && <span className="ml-4 text-[11px] font-bold uppercase tracking-widest">{item.label}</span>}
            </div>
          ))}
        </div>
        <div className="px-6 py-4" onClick={() => supabase.auth.signOut()}><Power size={24} className="text-slate-600 hover:text-red-500 cursor-pointer transition-colors" /></div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="ml-20 pt-24 px-8 pb-32 min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {activeTab === 'board' && (
              <>
                <AIInsights userId={session.user.id} />
                {/* Level Card */}

                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-active p-8 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4"><span className="px-3 py-1 glass-panel rounded-full text-[10px] font-bold text-[#00f2ff] tracking-widest uppercase">LEVEL {level}</span></div>
                  <div className="flex justify-between items-end mb-8 gap-4">
                    <div>
                      <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2 leading-none">{getIdentity(level)}</h2>
                      <p className="text-[#00f2ff] font-mono text-[11px] font-bold tracking-[0.2em] uppercase">PHASE: {getPhase(level).name} • MODE: {profile.mode || 'BUILDER'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1 leading-none">NEXT IDENTITY SHIFT</p>
                      <p className="text-3xl font-black tracking-tight">{1000 - (xp % 1000)} XP</p>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-3 border border-white/10 cyber-glow-inner p-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(xp % 1000) / 10}%` }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-[#00f2ff] via-[#00f2ff] to-[#7000ff] rounded-full xp-bar-glow" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    <span>{xp % 1000} / 1000 XP</span>
                    <span className="text-[#00f2ff]">{getPhase(level).name} PHASE</span>
                  </div>
                </motion.section>

                {/* Missions */}
                <div className="space-y-12">
                  {[
                    { id: 'pending', label: 'DAILY_COMMAND', color: 'text-[#00f2ff]' },
                    { id: 'in-progress', label: 'ACTIVE_OPS', color: 'text-yellow-400' },
                    { id: 'completed', label: 'COMPLETED_MANDATES', color: 'text-green-400' }
                  ].map(phase => {
                    const phaseTasks = tasks.filter(t => t.status === phase.id);
                    if (phaseTasks.length === 0 && phase.id !== 'pending') return null;
                    return (
                      <div key={phase.id} className="space-y-4">
                         <div className="flex justify-between items-center px-2">
                           <div className="flex items-center space-x-3">
                             <div className={`w-1 h-4 rounded-full bg-current ${phase.color}`} />
                             <h3 className={`text-[10px] font-black tracking-[0.3em] uppercase ${phase.color}`}>{phase.label} <span className="opacity-40">[{phaseTasks.length}]</span></h3>
                           </div>
                           {phase.id === 'pending' && <button onClick={() => setIsModalOpen(true)} className="bg-[#00f2ff] text-black text-[10px] font-bold px-5 py-2 rounded-lg hover:shadow-[0_0_25px_rgba(0,242,255,0.4)] transition-all uppercase tracking-widest">+ NEW MISSION</button>}
                         </div>
                         <div className="space-y-3">
                           {phaseTasks.map(task => (
                             <motion.div 
                               layout key={task.id} 
                               className="glass-panel p-5 rounded-xl flex items-center justify-between border-transparent hover:border-[#00f2ff]/30 transition-all cursor-pointer group"
                               onClick={(e) => {
                                  if ((e.target as HTMLElement).closest('.task-actions')) return;
                                  const next: any = task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending';
                                  
                                  if (next === 'completed') {
                                    setTaskPendingCompletion(task);
                                    setIsProofModalOpen(true);
                                  } else {
                                    updateTaskStatus(task, next);
                                  }
                               }}
                             >
                               <div className="flex items-center space-x-5 flex-1 min-w-0">
                                 <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-green-500 border-green-500' : task.status === 'in-progress' ? 'border-yellow-500' : 'border-[#00f2ff]/30'}`}>
                                    {task.status === 'completed' && <Check size={14} className="text-black" />}
                                    {task.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center space-x-2">
                                      <h4 className={`font-bold truncate ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>{task.title}</h4>
                                      {task.link && <a href={task.link} target="_blank" rel="noreferrer" className="text-[#00f2ff] task-actions"><ExternalLink size={14} /></a>}
                                      {task.assigned_by && <ShieldCheck size={12} className="text-[#00f2ff]" />}
                                   </div>
                                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mt-1">{task.module} • {task.type || 'DAILY'}</p>
                                   <div className="flex items-center space-x-3 mt-2">
                                      {task.description && <div className="w-1 h-1 rounded-full bg-slate-700" />}
                                      {task.image_url && <div className="w-1 h-1 rounded-full bg-purple-500" />}
                                      {task.assigned_by && <div className="px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] text-[8px] font-black uppercase">Guardian Protocol</div>}
                                   </div>
                                 </div>
                               </div>
                               <div className="flex items-center space-x-6">
                                 <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest shrink-0">+{task.xp} XP</span>
                                 <div className="relative task-actions">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveTaskIdMenu(activeTaskIdMenu === task.id ? null : task.id); }} className="text-slate-600 hover:text-white p-1"><MoreVertical size={20} /></button>
                                    <AnimatePresence>
                                       {activeTaskIdMenu === task.id && (
                                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 bottom-full mb-2 w-32 bg-black border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsModalOpen(true); setActiveTaskIdMenu(null); }} className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase hover:bg-[#00f2ff]/10 text-slate-300 hover:text-[#00f2ff]">Edit Intel</button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); setActiveTaskIdMenu(null); }} className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase hover:bg-red-500/10 text-red-500">Terminate</button>
                                         </motion.div>
                                       )}
                                    </AnimatePresence>
                                 </div>
                               </div>
                             </motion.div>
                           ))}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

             {activeTab === 'levels' && <Leaderboard currentUser={{ id: session.user.id, name: profile.full_name || 'Pilot', level, xp, img: profile.avatar_url || PILOT_IMG }} />}
            {activeTab === 'reports' && <Reports tasks={tasks} />}
            {activeTab === 'parent' && <ParentDashboard parentProfile={profile} />}
            {activeTab === 'profile' && <LevelBoard xp={xp} level={level} streak={streak} tasks={tasks} profile={profile} onUpdate={initialize} userId={session.user.id} />}
            {activeTab === 'settings' && (
              <div className="space-y-8 pb-20">
                <div className="px-2">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">CORE SETTINGS</h2>
                  <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">System Configuration & Identity Modes</p>
                </div>
                
                <div className="glass-panel p-8 rounded-2xl space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#00f2ff] uppercase tracking-[0.2em]">IDENTITY MODE SELECTION</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">Switching identity modes adjusts your neural focus and XP multipliers. Higher intensity modes offer greater rewards but require stricter execution.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {[
                        { id: 'Builder', icon: Cloud, mult: '1.0x', desc: 'Balanced operational growth.' },
                        { id: 'Money', icon: Bolt, mult: '1.5x', desc: 'Focus on revenue mandates.' },
                        { id: 'Monk', icon: Info, mult: '1.2x', desc: 'Deep work & discipline.' },
                        { id: 'War', icon: Flame, mult: '2.0x', desc: 'Maximum intensity execution.' }
                      ].map(mode => (
                        <div 
                          key={mode.id}
                          onClick={async () => {
                            await supabase.from('profiles').update({ mode: mode.id }).eq('id', session.user.id);
                            logActivity(session.user.id, 'mode_change', { from: profile.mode, to: mode.id });
                            initialize();
                          }}

                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${profile.mode === mode.id ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                        >
                          <mode.icon className={`w-8 h-8 mb-4 ${profile.mode === mode.id ? 'text-[#00f2ff]' : 'text-slate-500'}`} />
                          <h4 className="font-bold uppercase tracking-tight mb-1">{mode.id}</h4>
                          <p className="text-[10px] font-mono font-bold text-[#00f2ff] mb-2">{mode.mult} XP Yield</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{mode.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                   <div className="pt-8 border-t border-white/5 space-y-4">
                      <h3 className="text-xs font-bold text-[#00f2ff] uppercase tracking-[0.2em]">IDENTITY ROLE</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Designate your operational status. Parents can oversee child units, assign mandates, and verify evidence.</p>
                      <div className="flex space-x-4">
                         {['user', 'parent'].map(r => (
                           <button 
                             key={r}
                             onClick={async () => {
                               await supabase.from('profiles').update({ role: r }).eq('id', session.user.id);
                               initialize();
                             }}
                             className={`px-6 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${profile.role === r ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'}`}
                           >
                             {r === 'user' ? 'Operator (Child)' : 'Guardian (Parent)'}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5 space-y-4">
                     <h3 className="text-xs font-bold text-[#00f2ff] uppercase tracking-[0.2em]">MODULE CONFIGURATION</h3>
                     <div className="flex flex-wrap gap-2">
                        {(profile.custom_modules || []).map((m: string) => (
                          <span key={m} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">{m}</span>
                        ))}
                        <button className="px-4 py-2 border border-dashed border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-[#00f2ff]/50 hover:text-white transition-all">+ Add Sector</button>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ASIDE */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
             <motion.section whileHover={{ scale: 1.02 }} className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center relative overflow-hidden group shadow-[0_15px_50px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="w-24 h-24 mb-6 flex items-center justify-center relative"><div className="absolute inset-0 bg-orange-500/20 blur-3xl animate-pulse" /><Flame size={64} className="text-orange-500 fill-orange-500" /></div>
                  <h3 className="text-6xl font-black tracking-tighter mb-1">{streak}</h3>
                  <p className="text-orange-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">DAY STREAK ACTIVE</p>
                  <p className="text-slate-500 text-[9px] leading-relaxed italic max-w-[200px]">"Maintain operational consistency for 6 more cycles to unlock the Eternal Flame module."</p>
                </div>
             </motion.section>

             <section className="glass-panel p-6 rounded-2xl border-[#00f2ff]/10">
                <h3 className="text-[10px] font-bold text-[#00f2ff] tracking-[0.2em] uppercase border-b border-white/5 pb-4 mb-6 flex items-center"><Info size={14} className="mr-2" /> OPERATIONAL INTEL</h3>
                <div className="space-y-6">
                   <div className="flex items-start space-x-4"><div className="w-2 h-2 mt-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.6)]" /><p className="text-xs text-slate-300 leading-relaxed font-medium">Efficiency: <span className="text-[#00f2ff] font-bold">{tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%</span> across all sectors.</p></div>
                   <div className="flex items-start space-x-4"><div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(112,0,255,0.6)]" /><p className="text-xs text-slate-300 leading-relaxed font-medium">Identity Mode: <span className="text-purple-400 font-bold">{profile.mode || 'Builder'}</span>. XP Yield: <span className="text-purple-400 font-bold">x1.25</span>.</p></div>
                </div>
             </section>
          </aside>
        </div>
      </main>

      <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} editingTask={editingTask} modules={profile.custom_modules || ['General', 'Strategy', 'Focus']} />

      <ProofModal 
        isOpen={isProofModalOpen} 
        onClose={() => { setIsProofModalOpen(false); setTaskPendingCompletion(null); }} 
        onConfirm={(proofData) => {
          if (taskPendingCompletion) {
            updateTaskStatus(taskPendingCompletion, 'completed', proofData);
            setIsProofModalOpen(false);
            setTaskPendingCompletion(null);
          }
        }} 
        taskTitle={taskPendingCompletion?.title || ''} 
      />

      {/* STATUS BAR */}
      <motion.div initial={{ y: 50, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} className="fixed bottom-8 left-1/2 glass-panel px-10 py-4 rounded-full flex items-center space-x-12 z-50 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all hover:border-[#00f2ff]/30">
        <div className="flex items-center space-x-3"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]" /><span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">ENCRYPTION: ACTIVE</span></div>
        <div className="flex items-center space-x-3"><Bolt size={14} className="text-[#00f2ff]" /><span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">SYNC: 100%</span></div>
        <div className="flex items-center space-x-3"><Cloud size={14} className="text-purple-400" /><span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">NEURAL: STABLE</span></div>
      </motion.div>
      {/* NOTIFICATIONS */}
      <div className="fixed top-20 right-8 z-[100] space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl border-l-4 shadow-2xl backdrop-blur-xl flex items-center space-x-4 min-w-[300px] pointer-events-auto ${n.type === 'warn' ? 'bg-red-500/10 border-red-500' : 'bg-[#00f2ff]/10 border-[#00f2ff]'}`}
            >
              <div className={n.type === 'warn' ? 'text-red-500' : 'text-[#00f2ff]'}>
                {n.type === 'warn' ? <Flame size={20} /> : <Zap size={20} />}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">{n.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AICoach userId={session.user.id} />

    </div>
  );
}

