import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Plus, 
  Zap, 
  Flame,
  User
} from 'lucide-react';
import { supabase } from './supabaseClient';
import TaskBoard from './components/TaskBoard';
import LevelBoard from './components/LevelBoard';
import Reports from './components/Reports';
import TaskModal from './components/TaskModal';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';

import type { Task, Status } from './types';

const PILOT_IMG = "https://media.gemini.googleusercontent.com/api/2/media/0339e4a9-cfcd-4306-95c0-33fb86df6e25/1777583583280.png";

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

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const timeout = setTimeout(() => {
          setLoading(false); // Force stop loading if it takes too long
        }, 5000);

        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeout);
        setSession(session);
        setLoading(false);
      } catch (err) {
        console.error("Auth Error:", err);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    
    // Fetch user data from Supabase
    const fetchData = async () => {
      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').eq('user_id', session.user.id);
      
      // Safety: Try to get profile, if it doesn't exist, create it
      let { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, initialize it
        const { data: newProfile, error: initError } = await supabase
          .from('profiles')
          .insert([{ id: session.user.id, email: session.user.email, xp: 0, level: 1, streak: 0 }])
          .select()
          .single();
        if (initError) console.error("Profile Init Error:", initError);
        profileData = newProfile;
      }
      
      if (tasksError) console.error("Tasks Fetch Error:", tasksError);
      
      if (tasksData) setTasks(tasksData);
      if (profileData) {
        setXp(profileData.xp || 0);
        setLevel(profileData.level || 1);
        setStreak(profileData.streak || 0);
      }
    };
    
    fetchData();
  }, [session]);

  const handleSaveTask = async (taskData: any) => {
    if (!session) return;

    try {
      if (editingTask) {
        const { data, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id)
          .select()
          .single();
        
        if (error) throw error;
        if (data) setTasks(tasks.map(t => t.id === editingTask.id ? data : t));
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ ...taskData, user_id: session.user.id, status: 'todo' }])
          .select()
          .single();
        
        if (error) throw error;
        if (data) setTasks([...tasks, data]);
      }
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("MISSION_SAVE_FAILURE:", err.message);
      alert("MISSION FAILURE: " + err.message);
    }
  };

  const updateTaskStatus = async (id: string, status: Status) => {
    if (!session) return;
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const { data } = await supabase
      .from('tasks')
      .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();

    if (data) {
      if (status === 'done' && task.status !== 'done') handleTaskCompletion(task);
      setTasks(tasks.map(t => t.id === id ? data : t));
    }
  };

  const handleTaskCompletion = async (task: Task) => {
    const xpGain = task.priority === 'high' ? 500 : task.priority === 'medium' ? 150 : 50;
    const newXp = xp + xpGain;
    let newLevel = level;
    if (Math.floor(newXp / 15000) > Math.floor(xp / 15000)) newLevel = level + 1;
    
    setXp(newXp);
    setLevel(newLevel);
    setStreak(prev => prev + 1);

    // Update profile in Supabase
    await supabase.from('profiles').update({ xp: newXp, level: newLevel, streak: streak + 1 }).eq('id', session.user.id);
  };

  const xpProgress = (xp % 15000) / 150;

  if (loading) {
    return (
      <div className="login-bg flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-cyan-400 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,242,255,0.4)] animate-pulse">
           <Zap size={44} className="text-black" strokeWidth={3} />
        </div>
        <p className="label-caps text-cyan-400 animate-pulse tracking-[4px]">CONNECTING TO SERVER...</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="app-viewport">
      {/* SUPREME COMMANDER: TOP BAR (Desktop Only) */}
      <header className="top-bar-supreme hidden lg:flex">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-display-xl uppercase tracking-tighter italic">
          ARPAN-TODO
        </div>
        
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-96 hover:border-cyan-500/50 transition-all duration-300">
          <span className="material-symbols-outlined text-slate-400 mr-2 text-sm">search</span>
          <input 
            className="bg-transparent border-none outline-none text-[10px] font-label-caps uppercase text-white placeholder-slate-500 w-full" 
            placeholder="QUERY DATABASE..." 
            type="text"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-4">
            <span className="material-symbols-outlined text-slate-400 hover:text-cyan-400 cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-slate-400 hover:text-cyan-400 cursor-pointer">settings</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-cyan-400/50 overflow-hidden shadow-[0_0_15px_rgba(0,242,255,0.2)]">
            <img src={PILOT_IMG} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* SUPREME COMMANDER: SIDE RAIL (Desktop Only) */}
      <nav className="side-rail-supreme hidden lg:flex group">
        <div className="px-6 py-8 mb-8 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-black text-xs">token</span>
          </div>
          <div>
            <p className="font-label-caps text-[10px] text-cyan-400">OPERATOR</p>
            <p className="text-[10px] text-slate-500">Elite Commander</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-2">
          <div 
            onClick={() => setActiveTab('board')}
            className={`${activeTab === 'board' ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-4 border-cyan-400' : 'text-slate-500'} flex items-center h-12 px-6 cursor-pointer hover:bg-white/5 transition-all duration-300`}
          >
            <span className="material-symbols-outlined">grid_view</span>
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity font-label-caps whitespace-nowrap">Command</span>
          </div>

          <div 
            onClick={() => setActiveTab('levels')}
            className={`${activeTab === 'levels' ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-4 border-cyan-400' : 'text-slate-500'} flex items-center h-12 px-6 cursor-pointer hover:bg-white/5 transition-all duration-300`}
          >
            <span className="material-symbols-outlined">target</span>
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity font-label-caps whitespace-nowrap">Objectives</span>
          </div>

          <div 
            onClick={() => setActiveTab('reports')}
            className={`${activeTab === 'reports' ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-4 border-cyan-400' : 'text-slate-500'} flex items-center h-12 px-6 cursor-pointer hover:bg-white/5 transition-all duration-300`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity font-label-caps whitespace-nowrap">Intel</span>
          </div>

          <div 
            onClick={() => setActiveTab('profile')}
            className={`${activeTab === 'profile' ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-4 border-cyan-400' : 'text-slate-500'} flex items-center h-12 px-6 cursor-pointer hover:bg-white/5 transition-all duration-300`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity font-label-caps whitespace-nowrap">Squad</span>
          </div>
        </div>

        <div className="px-6 py-8">
          <div onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-red-500 transition-colors flex items-center h-12 cursor-pointer">
            <span className="material-symbols-outlined">power_settings_new</span>
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity font-label-caps whitespace-nowrap">Logout</span>
          </div>
        </div>
      </nav>

      {/* MOBILE HEADER (Preserved) */}
      <header className="app-header lg:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #00f2ff', overflow: 'hidden' }}>
            <img src={PILOT_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '2px' }}>ARPAN-TODO</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#111', borderRadius: '20px', border: '1px solid #333' }}>
          <Flame size={14} style={{ color: '#ff3b30' }} fill="#ff3b30" />
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{streak}</span>
        </button>
      </header>

      {/* MAIN CONTENT ENGINE */}
      <div className="scroll-area lg:desktop-main-layout">
        {activeTab === 'board' && (
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Supreme Level Card */}
            <section className="glass-panel-active p-8 rounded-xl relative overflow-hidden hidden lg:block">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-3 py-1 bg-black/40 rounded-full text-[10px] font-label-caps text-cyan-400 border border-cyan-500/30">LEVEL {level}</span>
              </div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">CYBER_KNIGHT</h2>
                  <p className="text-cyan-400 font-label-caps text-[10px] tracking-widest mt-1">RANK: SUPREME COMMANDER • SYSTEM INTEGRITY 100%</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-label-caps text-[9px] mb-1">NEXT LEVEL IN</p>
                  <p className="font-black text-2xl text-white italic">{15000 - (xp % 15000)} XP</p>
                </div>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-600 xp-bar-glow transition-all duration-1000" 
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] font-label-caps text-slate-500">
                <span>{xp % 15000} / 15,000 XP</span>
                <span>{Math.round(xpProgress)}% COMPLETE</span>
              </div>
            </section>

            {/* Mobile Rank Card (Preserved) */}
            <div className="dashboard-grid lg:hidden">
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="label-caps" style={{ color: '#00f2ff' }}>PILOT LEVEL</span>
                  <span className="label-caps" style={{ color: '#7000ff' }}>NEXT RANK</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '48px', fontWeight: 900 }}>{level}</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#7000ff' }}>CYBER_KNIGHT</span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                    <span>{xp % 15000} XP</span>
                    <span>15,000 XP</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#1a1a1a', borderRadius: '4px' }}>
                    <div style={{ width: `${xpProgress || 5}%`, height: '100%', background: 'linear-gradient(90deg, #00f2ff, #7000ff)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ textAlign: 'center' }}>
                <span className="label-caps" style={{ color: '#ff3b30', marginBottom: '8px', display: 'block' }}>ACTIVE STREAK</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <Flame size={32} style={{ color: '#ff3b30' }} fill="#ff3b30" />
                  <span style={{ fontSize: '48px', fontWeight: 900 }}>{streak}</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#666', alignSelf: 'flex-end', marginBottom: '8px' }}>DAYS</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', borderBottom: '1px solid #222', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, fontStyle: 'italic' }}>DAILY COMMAND</h2>
              <button 
                className="lg:block hidden bg-cyan-400 text-black font-label-caps text-[10px] px-4 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all font-bold"
                onClick={() => setIsModalOpen(true)}
              >
                + NEW MISSION
              </button>
              <span className="label-caps lg:hidden" style={{ color: '#00f2ff' }}>VIEW ALL</span>
            </div>

            <TaskBoard tasks={tasks} onUpdateStatus={updateTaskStatus} onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />
          </div>
        )}

        {/* SIDEBAR ASIDE (Desktop Only) */}
        {activeTab === 'board' && (
          <aside className="col-span-4 space-y-8 hidden lg:block">
            <section className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mb-6 flex items-center justify-center relative mx-auto">
                  <div className="absolute inset-0 animate-pulse bg-orange-500/20 blur-3xl rounded-full"></div>
                  <span className="material-symbols-outlined text-6xl text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
                <h3 className="text-6xl font-black text-white italic tracking-tighter">{streak}</h3>
                <p className="font-label-caps text-orange-400 text-xs tracking-[0.2em] mb-4">DAY STREAK ACTIVE</p>
                <p className="text-slate-500 text-[10px] leading-relaxed max-w-xs mx-auto font-bold uppercase">Maintain operational consistency for {7 - (streak % 7)} more cycles to unlock the "Eternal Flame" module.</p>
              </div>
            </section>

            <Reports tasks={tasks} />
          </aside>
        )}

        {(activeTab === 'levels' || activeTab === 'reports' || activeTab === 'profile') && (
          <div className="col-span-12">
             {activeTab === 'levels' && <Leaderboard currentUser={{ name: session.user.email?.split('@')[0] || 'Pilot', level: level, xp: xp, img: PILOT_IMG }} />}
             {activeTab === 'reports' && <Reports tasks={tasks} />}
             {activeTab === 'profile' && <LevelBoard xp={xp} level={level} streak={streak} tasks={tasks} />}
          </div>
        )}
      </div>

      {/* SUPREME COMMANDER: STATUS BAR (Desktop Only) */}
      <div className="floating-status-bar hidden lg:flex">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-label-caps text-slate-400">ENCRYPTION: ACTIVE</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xs text-cyan-400">bolt</span>
          <span className="text-[10px] font-label-caps text-slate-400">LATENCY: 14MS</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xs text-purple-400">cloud_done</span>
          <span className="text-[10px] font-label-caps text-slate-400">SYNC: 100%</span>
        </div>
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} editingTask={editingTask} />

      {/* MOBILE NAV (Preserved) */}
      <nav className="bottom-nav lg:hidden">
        <button className="nav-item" style={{ color: activeTab === 'board' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('board')}><LayoutDashboard size={24} /></button>
        <button className="nav-item" style={{ color: activeTab === 'levels' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('levels')}><Zap size={24} /></button>
        <button className="center-btn" onClick={() => setIsModalOpen(true)}><Plus size={36} strokeWidth={3} /></button>
        <button className="nav-item" style={{ color: activeTab === 'reports' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('reports')}><BarChart3 size={24} /></button>
        <button className="nav-item" style={{ color: activeTab === 'profile' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('profile')}><User size={24} /></button>
      </nav>
    </div>
  );
}

      <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} editingTask={editingTask} />

      <nav className="bottom-nav">
        <button className="nav-item" style={{ color: activeTab === 'board' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('board')}><LayoutDashboard size={24} /></button>
        <button className="nav-item" style={{ color: activeTab === 'levels' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('levels')}><Zap size={24} /></button>
        <button className="center-btn" onClick={() => setIsModalOpen(true)}><Plus size={36} strokeWidth={3} /></button>
        <button className="nav-item" style={{ color: activeTab === 'reports' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('reports')}><BarChart3 size={24} /></button>
        <button className="nav-item" style={{ color: activeTab === 'profile' ? '#00f2ff' : '#666' }} onClick={() => setActiveTab('profile')}><User size={24} /></button>
      </nav>
    </div>
  );
}

export default App;
