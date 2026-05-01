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
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', session.user.id);
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
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

    if (editingTask) {
      const { data } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)
        .select()
        .single();
      if (data) setTasks(tasks.map(t => t.id === editingTask.id ? data : t));
    } else {
      const { data } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: session.user.id, status: 'todo' }])
        .select()
        .single();
      if (data) setTasks([...tasks, data]);
    }
    setEditingTask(null);
    setIsModalOpen(false);
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
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar-desktop">
        <div style={{ padding: '0 16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #00f2ff', overflow: 'hidden', flexShrink: 0 }}>
              <img src={PILOT_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '1px' }}>ARPAN-TODO</h1>
              <p style={{ fontSize: '10px', color: '#00f2ff', fontWeight: 'bold', opacity: 0.6 }}>PILOT_ID: {session.user.email?.split('@')[0].toUpperCase()}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px', marginBottom: '40px', border: '1px solid rgba(0,242,255,0.2)' }}>
             <p className="label-caps" style={{ color: '#00f2ff', fontSize: '9px', marginBottom: '8px' }}>CORE STATUS</p>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 900 }}>LVL {level}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <Flame size={14} style={{ color: '#ff3b30' }} fill="#ff3b30" />
                   <span style={{ fontWeight: 'bold' }}>{streak}</span>
                </div>
             </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button className={`sidebar-item ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}><LayoutDashboard size={20} /> Missions</button>
          <button className={`sidebar-item ${activeTab === 'levels' ? 'active' : ''}`} onClick={() => setActiveTab('levels')}><Zap size={20} /> Rankings</button>
          <button className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><BarChart3 size={20} /> Intel</button>
          <button className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><User size={20} /> Profile</button>
        </nav>

        <button 
          onClick={() => supabase.auth.signOut()} 
          className="sidebar-item" 
          style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', borderRadius: 0, padding: '24px 16px' }}
        >
          <Flame size={20} style={{ color: '#ff3b30' }} /> LOGOUT_PILOT
        </button>
      </aside>

      <header className="app-header">
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

      <div className="scroll-area">
        {activeTab === 'board' && (
          <>
            <div className="dashboard-grid">
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
              <span className="label-caps" style={{ color: '#00f2ff' }}>VIEW ALL</span>
            </div>

            <TaskBoard tasks={tasks} onUpdateStatus={updateTaskStatus} onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />
          </>
        )}

        {activeTab === 'levels' && <Leaderboard currentUser={{ name: session.user.email?.split('@')[0] || 'Pilot', level: level, xp: xp, img: PILOT_IMG }} />}
        {activeTab === 'reports' && <Reports tasks={tasks} />}
        {activeTab === 'profile' && <LevelBoard xp={xp} level={level} streak={streak} tasks={tasks} />}
      </div>

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
