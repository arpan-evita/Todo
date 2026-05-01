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
  Info, 
  Flame, 
  Bolt, 
  Cloud,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import LevelBoard from './components/LevelBoard';
import Reports from './components/Reports';
import TaskModal from './components/TaskModal';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';

import type { Task, Status } from './types';

const PILOT_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuAh40g38_asydALJucbCa8FKAn_yk3LmmWOCj_t4mEtMW0xziM3cocNSjd-naohafI7akNLwzINnSboGd8BdzW_us1r3PoOwfBFcjMshG_67MrEPOUYCpZyagfMkJ6qwx45AKwHiIZGEQFPgLCrvzHpl6HhOdnfu14wjfgyFtXT7cuXAhETVHPfj-2LXxyE3HFrFyAwNg6rjE6LMETh4TSO6UEXsNwSIIUfCFKeP6_SPJD_1u8knrUFj021u-wo2Ij12j1wpT0JXS2a";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'board' | 'levels' | 'reports' | 'profile'>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchTasks();
    }
  }, [session]);

  const fetchProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (!error && data) {
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setStreak(data.streak || 0);
    }
  };

  const calculateStreak = (allTasks: Task[]) => {
    const completedDates = allTasks
      .filter(t => t.status === 'done' && t.completed_at)
      .map(t => new Date(t.completed_at!).toDateString());
    
    const uniqueDates = Array.from(new Set(completedDates)).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let currentStreak = 0;
    let checkDate = new Date(uniqueDates[0]);

    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = new Date(uniqueDates[i]).toDateString();
      if (dateStr === checkDate.toDateString()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setTasks(data);
      setStreak(calculateStreak(data));
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      const { error } = await supabase.from('tasks').update(taskData).eq('id', editingTask.id);
      if (error) {
        console.error('Update Error:', error);
        alert(`Sync Failed: ${error.message}`);
      } else {
        fetchTasks();
      }
    } else {
      const { error } = await supabase.from('tasks').insert([{ 
        ...taskData, 
        user_id: session.user.id, 
        status: 'todo',
        created_at: new Date().toISOString()
      }]);
      if (error) {
        console.error('Insert Error:', error);
        alert(`Deployment Failed: ${error.message}. Ensure your database columns (module, image_url, notes) are created.`);
      } else {
        fetchTasks();
      }
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const updateTaskStatus = async (id: string, newStatus: Status) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const oldStatus = task.status;
    const { error } = await supabase.from('tasks').update({ 
      status: newStatus, 
      completed_at: newStatus === 'done' ? new Date().toISOString() : null 
    }).eq('id', id);
    
    if (!error) {
      const taskXp = task.xp || 150;
      // Transactional XP logic: Add if moving to done, remove if moving away from done
      if (newStatus === 'done' && oldStatus !== 'done') {
        grantXp(taskXp);
      } else if (oldStatus === 'done' && newStatus !== 'done') {
        grantXp(-taskXp);
      }
      fetchTasks();
    }
  };

  const grantXp = async (amount: number) => {
    const newXp = Math.max(0, xp + amount);
    const newLevel = Math.floor(newXp / 5000) + 1;
    
    setXp(newXp);
    setLevel(newLevel);
    await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', session.user.id);
  };

  const xpProgress = (xp % 5000) / 50;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-cyan-400 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,255,0.4)] animate-pulse">
           <Cpu size={32} className="text-black" />
        </div>
        <p className="font-mono text-[10px] font-bold text-cyan-400 tracking-[0.3em] uppercase animate-pulse">Initializing Neural Link...</p>
      </div>
    );
  }

  if (!session) return <Login />;

  const navItems = [
    { id: 'board', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'levels', icon: Trophy, label: 'Leaderboard' },
    { id: 'reports', icon: BarChart3, label: 'Report' },
    { id: 'profile', icon: User, label: 'Your Details' },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* LUXURY HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 flex justify-between items-center h-16 px-8 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter uppercase font-sans">
          ARPAN-TODO
        </div>

        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-96 hover:border-cyan-500/50 transition-all duration-300 group">
          <Search className="w-4 h-4 text-slate-400 mr-2 group-hover:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="QUERY DATABASE..." 
            className="bg-transparent border-none outline-none text-[10px] font-mono font-bold tracking-widest text-white placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-4">
            <button className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </button>
            <button className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-full border border-cyan-400/50 overflow-hidden ring-2 ring-transparent hover:ring-cyan-400/50 transition-all cursor-pointer">
            <img src={PILOT_IMG} alt="Pilot Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* LUXURY SIDEBAR */}
      <nav 
        className="fixed left-0 top-16 h-[calc(100vh-64px)] w-20 hover:w-64 transition-all duration-500 bg-black/80 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col py-6 z-40 group"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="px-6 mb-8 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest">OPERATOR</p>
            <p className="text-[10px] text-slate-500">Elite Commander</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-2">
          {navItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center h-12 px-6 cursor-pointer transition-all duration-300 group/item relative ${
                activeTab === item.id 
                ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-4 border-cyan-400' 
                : 'text-slate-500 hover:bg-white/10 hover:text-cyan-300'
              }`}
            >
              <item.icon className={`w-6 h-6 shrink-0 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
              <AnimatePresence>
                {isSidebarHovered && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 font-mono text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="px-6 py-4">
          <div onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-red-500 transition-colors flex items-center h-12 cursor-pointer group/item">
            <Power className="w-6 h-6 shrink-0" />
            <AnimatePresence>
              {isSidebarHovered && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-4 font-mono text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="ml-20 pt-24 px-8 pb-32 min-h-screen grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {activeTab === 'board' && (
            <>
              {/* Level Progress Card */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel-active p-6 rounded-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-3 py-1 glass-panel rounded-full text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30 tracking-widest">
                    LEVEL {level}
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2">CYBER_KNIGHT</h2>
                    <p className="text-cyan-400 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                      RANK: SUPREME COMMANDER • SYSTEM INTEGRITY 98%
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-slate-400 font-mono text-[10px] font-bold tracking-widest mb-1">NEXT LEVEL IN</p>
                    <p className="text-3xl font-black text-white tracking-tight">{5000 - (xp % 5000)} XP</p>
                  </div>
                </div>

                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3 cyber-glow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-600 xp-bar-glow"
                  />
                </div>
                
                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                  <span>{xp % 5000} / 5,000 XP</span>
                  <span className="text-cyan-400 group-hover:text-white transition-colors duration-500">{Math.round(xpProgress)}% COMPLETE</span>
                </div>
              </motion.section>

              {/* Tri-Phase Task Sections */}
              <section className="space-y-12">
                {[
                  { id: 'todo', label: 'DAILY_COMMAND', color: 'text-cyan-400' },
                  { id: 'in-progress', label: 'ACTIVE_OPS', color: 'text-yellow-400' },
                  { id: 'done', label: 'COMPLETED_MANDATES', color: 'text-green-400' }
                ].map((phase) => {
                  const phaseTasks = tasks.filter(t => t.status === phase.id);
                  if (phaseTasks.length === 0 && phase.id !== 'todo') return null;

                  return (
                    <div key={phase.id} className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-1 h-4 rounded-full bg-current ${phase.color}`} />
                          <h3 className={`text-[10px] font-mono font-black tracking-[0.3em] uppercase ${phase.color}`}>
                            {phase.label} <span className="opacity-40">[{phaseTasks.length}]</span>
                          </h3>
                        </div>
                        {phase.id === 'todo' && (
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary-container text-black font-mono font-bold text-[10px] px-5 py-2.5 rounded-lg hover:shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:scale-105 active:scale-95 transition-all tracking-widest uppercase"
                          >
                            + NEW MISSION
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {phaseTasks.map((task) => (
                          <motion.div 
                            layout
                            key={task.id}
                            className={`glass-panel p-4 rounded-xl flex items-center justify-between hover:border-cyan-500/40 transition-all cursor-pointer group ${task.status === 'done' ? 'opacity-50 grayscale-[0.5]' : ''}`}
                            onClick={() => {
                              const nextStatus: any = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
                              updateTaskStatus(task.id, nextStatus);
                            }}
                          >
                            <div className="flex items-center space-x-5 flex-1">
                              <div className={`w-6 h-6 border-2 transition-all flex items-center justify-center rounded shrink-0 ${
                                task.status === 'done' ? 'bg-green-500 border-green-500' : 
                                task.status === 'in-progress' ? 'bg-yellow-500/20 border-yellow-500' :
                                'border-cyan-500/50 group-hover:border-cyan-400'
                              }`}>
                                {task.status === 'done' && <Check className="w-4 h-4 text-black" />}
                                {task.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                              </div>
                              
                              {task.image_url && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0 hidden sm:block">
                                  <img src={task.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Mission Intel" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <h4 className={`text-white font-semibold truncate transition-all ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
                                <p className="text-slate-500 text-[11px] font-medium font-mono truncate">
                                  {task.module ? `[${task.module}] • ` : ''}
                                  {task.status === 'done' ? 'Mandate Completed' : task.status === 'in-progress' ? 'Tactical Execution Active' : 'Awaiting Deployment'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-5 ml-4">
                              {task.status !== 'done' ? (
                                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded tracking-widest shrink-0 ${
                                  task.priority === 'high' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 bg-white/5'
                                }`}>
                                  {task.priority.toUpperCase()} PRIORITY
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest shrink-0">+{task.xp || 150} XP</span>
                              )}
                              <button className="text-slate-500 hover:text-white transition-colors">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          {activeTab === 'levels' && <Leaderboard currentUser={{ name: session.user.email?.split('@')[0] || 'Pilot', level, xp, img: PILOT_IMG }} />}
          {activeTab === 'reports' && <Reports tasks={tasks} />}
          {activeTab === 'profile' && <LevelBoard xp={xp} level={level} streak={streak} tasks={tasks} />}
        </div>

        {/* Right Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* Day Streak */}
          <motion.section 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-8 rounded-xl flex flex-col items-center text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative z-10">
              <div className="w-24 h-24 mb-6 flex items-center justify-center relative">
                <div className="absolute inset-0 animate-pulse bg-orange-500/20 blur-3xl rounded-full" />
                <Flame size={64} className="text-orange-500 fill-orange-500" />
              </div>
              <h3 className="text-5xl font-black text-white tracking-tighter mb-1">{streak}</h3>
              <p className="font-mono text-orange-400 text-xs font-bold tracking-[0.25em] mb-4 uppercase">DAY STREAK ACTIVE</p>
              <p className="text-slate-500 text-[10px] leading-relaxed max-w-[240px] font-medium italic">
                "Maintain operational consistency for 6 more cycles to unlock the Eternal Flame cosmetic module."
              </p>
            </div>
          </motion.section>

          {/* Intel Brief */}
          <section className="glass-panel p-5 rounded-xl border-cyan-500/10">
            <h3 className="font-mono text-[10px] font-bold text-cyan-400 mb-6 border-b border-cyan-500/20 pb-3 flex items-center tracking-[0.2em] uppercase">
              <Info className="w-4 h-4 mr-2" />
              SQUAD INTEL BRIEF
            </h3>
            <div className="space-y-5">
              {[
                { color: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.6)]', text: <>Operational efficiency at <span className="text-cyan-400 font-bold">{tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%</span> in your sector.</> },
                { color: 'bg-purple-500 shadow-[0_0_8px_rgba(112,0,255,0.6)]', text: <><span className="text-purple-400 font-bold">{tasks.filter(t => t.status === 'in-progress').length}</span> active mandates currently in tactical execution.</> },
                { color: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]', text: <>Bounty pool: <span className="text-yellow-400 font-bold">{tasks.filter(t => t.status !== 'done').reduce((acc, t) => acc + (t.xp || 150), 0)} XP</span> available for claim.</> },
              ].map((intel, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${intel.color}`} />
                  <p className="text-[12px] text-slate-300 leading-relaxed font-medium">{intel.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mission Log / Calendar */}
          <section className="glass-panel p-5 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono text-[11px] font-bold text-white tracking-widest uppercase">MISSION LOG</h3>
              <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest">
                {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()} {new Date().getFullYear()}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                <div key={d} className="text-[9px] font-mono font-bold text-slate-600 mb-2">{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 3; // Simplified calendar view
                if (day < 1 || day > 31) return <div key={i} className="aspect-square" />;
                
                const hasTask = tasks.some(t => 
                  t.status === 'done' && 
                  t.completed_at && 
                  new Date(t.completed_at).getDate() === day &&
                  new Date(t.completed_at).getMonth() === new Date().getMonth()
                );

                const isToday = day === new Date().getDate();

                return (
                  <div 
                    key={i} 
                    className={`aspect-square flex items-center justify-center text-[10px] font-mono font-bold rounded-lg transition-all ${
                      hasTask 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,255,0.1)]' 
                      : 'text-slate-700 hover:bg-white/5'
                    } ${isToday ? 'border-b-2 border-cyan-400' : ''}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Decorative Panel */}
          <div className="rounded-xl overflow-hidden border border-white/10 group relative h-48">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS-n2_Lm3e2OkTXO82c1POXDUM76cvnIn7ZZQ16ufXlgKL-8BvoOjqfvB2Rs5Any5sDXxwYO2Gan6R-T9E0Jv2Ye84_J_9gGskOipCQTmYvh_UJsaKwLfbvQTqkyG5adtsAze0k4V4o5C24A4ZxjhQlmDhZyeRHfxsVoJwkn9sP0eEGuXWGnS6PN25iTCt5SJo0idJ3ZLqkDhKu6DumvjjtCk6slYCXq_bbgu_s94yhpbeJcueqZaautcQ_GKsa_BUIktNwLjCdf5Q" 
              alt="Mission Context" 
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4">
              <p className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase">DISTRICT_07</p>
              <p className="text-[8px] text-slate-400 uppercase">Sector Status: Stable</p>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Status Bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        className="fixed bottom-6 left-1/2 glass-panel px-8 py-3.5 rounded-full flex items-center space-x-10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] z-50 border border-white/10 ring-1 ring-white/5 transition-all hover:border-cyan-500/30"
      >
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest leading-none">ENCRYPTION: ACTIVE</span>
        </div>
        
        <div className="h-5 w-px bg-white/10" />
        
        <div className="flex items-center space-x-3">
          <Bolt className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest leading-none">LATENCY: 14MS</span>
        </div>
        
        <div className="h-5 w-px bg-white/10" />
        
        <div className="flex items-center space-x-3">
          <Cloud className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest leading-none">SYNC: 100%</span>
        </div>
      </motion.div>

      <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} editingTask={editingTask} />

      {/* Glow effects */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}

export default App;
