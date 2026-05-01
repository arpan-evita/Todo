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
    <div className="supreme-container">
      {/* SUPREME COMMANDER: TOP STRAT-BAR (Desktop Only) */}
      <header className="top-strat-bar hidden lg:flex">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-display-xl uppercase tracking-tighter italic">
            ARPAN-TODO
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-12">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">search</span>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-xs font-label-caps uppercase tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-300" 
              placeholder="QUERY MISSION DATABASE..." 
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-cyan-400/30 overflow-hidden shadow-[0_0_20px_rgba(0,242,255,0.15)] hover:border-cyan-400 transition-all cursor-pointer">
            <img src={PILOT_IMG} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* SUPREME COMMANDER: SIDE MISSION-RAIL (Desktop Only) */}
      <nav className="side-mission-rail group">
        <div className="px-6 mb-12 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-black text-sm font-bold">token</span>
          </div>
          <div className="overflow-hidden">
            <p className="label-caps-supreme text-cyan-400 whitespace-nowrap">ARPAN COMMANDER</p>
            <p className="text-[9px] text-slate-500 whitespace-nowrap">MISSION CONTROL v4.2</p>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-2">
          {[
            { id: 'board', icon: 'grid_view', label: 'Command' },
            { id: 'levels', icon: 'target', label: 'Objectives' },
            { id: 'reports', icon: 'analytics', label: 'Intel' },
            { id: 'profile', icon: 'group', label: 'Squad' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center h-12 rounded-xl transition-all duration-300 px-4 group/item ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_15px_rgba(0,242,255,0.05)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-300 group-hover/item:scale-110 ${activeTab === item.id ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="ml-6 label-caps-supreme opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(0,242,255,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 mt-auto">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center h-12 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 px-4 group/logout"
          >
            <span className="material-symbols-outlined group-hover/logout:rotate-12 transition-transform">power_settings_new</span>
            <span className="ml-6 label-caps-supreme opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-red-500/80">TERMINATE</span>
          </button>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      <header className="flex lg:hidden items-center justify-between px-6 h-16 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full border border-cyan-400/50 overflow-hidden">
            <img src={PILOT_IMG} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-black italic tracking-tighter text-white">ARPAN-TODO</h1>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Flame size={14} className="text-red-500" fill="currentColor" />
          <span className="text-sm font-bold">{streak}</span>
        </div>
      </header>

      {/* SUPREME MAIN STAGE */}
      <main className="main-mission-stage">
        <div className="max-w-[1600px] mx-auto">
          {activeTab === 'board' && (
            <div className="iron-grid-12">
              {/* LEFT: MISSION HUB */}
              <div className="iron-col-8 space-y-8">
                {/* Supreme Rank Card */}
                <section className="hidden lg:block relative p-8 rounded-3xl bg-[#080808] border border-white/5 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">CYBER_KNIGHT</h2>
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-label-caps border border-cyan-500/20 rounded-full mb-4">LEVEL 42</div>
                        <p className="text-[10px] label-caps-supreme text-slate-500 tracking-widest mb-1">NEXT LEVEL IN</p>
                        <p className="text-3xl font-black text-white italic">1,250 XP</p>
                      </div>
                    </div>
                    <p className="text-cyan-400 label-caps-supreme mb-8">RANK: SUPREME COMMANDER • SYSTEM INTEGRITY 98%</p>
                    
                    <div className="space-y-4">
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all duration-1000" 
                          style={{ width: `${xpProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between label-caps-supreme text-slate-500">
                        <span>{xp % 15000} / 5,000 XP</span>
                        <span className="text-white/60">{Math.round(xpProgress)}% COMPLETE</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Task Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-3 text-white">
                    <span className="material-symbols-outlined text-cyan-400 fill-1">reorder</span>
                    <h3 className="daily-command-header">Daily Command</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                  >
                    + NEW MISSION
                  </button>
                </div>

                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="group relative p-6 bg-[#080808] border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all flex items-center">
                      <div className="mr-6">
                        <div 
                          onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                          className={`w-6 h-6 rounded border-2 transition-all cursor-pointer flex items-center justify-center ${
                            task.status === 'done' ? 'bg-cyan-400 border-cyan-400' : 'border-white/10 hover:border-cyan-400/50'
                          }`}
                        >
                          {task.status === 'done' && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold tracking-tight mb-1 ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 label-caps-supreme tracking-widest">Tactical • Due in 2 hours</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-2 py-0.5 bg-cyan-500/5 text-cyan-400 text-[8px] border border-cyan-500/20 rounded label-caps-supreme">HIGH PRIORITY</span>
                        <button className="text-slate-600 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: INTEL WING */}
              <aside className="iron-col-4 space-y-8 hidden lg:block">
                <section className="relative p-10 rounded-3xl bg-[#080808] border border-white/5 overflow-hidden text-center group">
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Flame size={32} className="text-orange-500" fill="currentColor" />
                    </div>
                    <h4 className="text-7xl font-black text-white italic tracking-tighter leading-none mb-2">{streak}</h4>
                    <p className="text-[10px] label-caps-supreme text-orange-500 mb-6">Day Streak Active</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase leading-relaxed max-w-[200px] mx-auto">Maintain operational consistency for 6 more cycles to unlock the "Eternal Flame" cosmetic module.</p>
                  </div>
                </section>

                {/* SQUAD INTEL BRIEF */}
                <section className="p-8 rounded-3xl bg-[#080808] border border-white/5 space-y-6">
                  <div className="flex items-center space-x-3 text-cyan-400">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <h4 className="label-caps-supreme">Squad Intel Brief</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">Global mission completion up <span className="text-cyan-400">12%</span> in your sector.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">Operator <span className="text-purple-400">@X_Zero</span> beat your record in tactical refactoring.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">System maintenance scheduled in 4 cycles. Backup data.</p>
                    </div>
                  </div>
                </section>

                {/* MISSION LOG (Calendar) */}
                <section className="p-8 rounded-3xl bg-[#080808] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="label-caps-supreme text-slate-400">Mission Log</h4>
                    <span className="text-[9px] label-caps-supreme text-slate-600 uppercase">October 2023</span>
                  </div>
                  <div className="grid grid-cols-7 gap-y-4 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => (
                      <span key={day} className="text-[9px] label-caps-supreme text-slate-700">{day}</span>
                    ))}
                    {[28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8].map((date, i) => (
                      <div key={i} className={`text-[10px] font-bold ${date === 3 ? 'text-cyan-400 p-1.5 border border-cyan-400/50 rounded-lg bg-cyan-400/10' : 'text-slate-600'}`}>
                        {date}
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          )}

          {(activeTab === 'levels' || activeTab === 'reports' || activeTab === 'profile') && (
            <div className="w-full">
               {activeTab === 'levels' && <Leaderboard currentUser={{ name: session.user.email?.split('@')[0] || 'Pilot', level: level, xp: xp, img: PILOT_IMG }} />}
               {activeTab === 'reports' && <Reports tasks={tasks} />}
               {activeTab === 'profile' && <LevelBoard xp={xp} level={level} streak={streak} tasks={tasks} />}
            </div>
          )}
        </div>
      </main>

      {/* SUPREME COMMANDER: STATUS DOCK */}
      <footer className="status-dock-supreme hidden lg:flex">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
          <span className="label-caps-supreme text-slate-400">SECURED</span>
        </div>
        <div className="w-px h-4 bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xs text-cyan-400">bolt</span>
          <span className="label-caps-supreme text-slate-400">14ms</span>
        </div>
        <div className="w-px h-4 bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xs text-purple-400">cloud_done</span>
          <span className="label-caps-supreme text-slate-400">SYNC: 100%</span>
        </div>
      </footer>

      <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSaveTask} editingTask={editingTask} />

      {/* MOBILE DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex lg:!hidden items-center justify-around px-4 z-[100]">
        <button onClick={() => setActiveTab('board')} className={`p-3 rounded-xl transition-all ${activeTab === 'board' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'}`}><LayoutDashboard size={24} /></button>
        <button onClick={() => setActiveTab('levels')} className={`p-3 rounded-xl transition-all ${activeTab === 'levels' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'}`}><Zap size={24} /></button>
        <button onClick={() => setIsModalOpen(true)} className="w-14 h-14 bg-cyan-400 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] active:scale-95 transition-all -translate-y-4 border-4 border-black"><Plus size={32} strokeWidth={3} /></button>
        <button onClick={() => setActiveTab('reports')} className={`p-3 rounded-xl transition-all ${activeTab === 'reports' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'}`}><BarChart3 size={24} /></button>
        <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'}`}><User size={24} /></button>
      </nav>
    </div>
  );
}

export default App;
