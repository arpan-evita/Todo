import React, { useState } from 'react';
import { Settings, Shield, Zap, Target, Bell, Eye, EyeOff, Save, Trash2, Cpu } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

interface SettingsProps {
  profile: {
    mode: string;
    custom_modules: string[];
  };
  onUpdate: () => void;
  userId: string;
}

export default function SettingsPage({ profile, onUpdate, userId }: SettingsProps) {
  const [mode, setMode] = useState(profile.mode || 'Builder');
  const [modules, setModules] = useState(profile.custom_modules || []);
  const [newModule, setNewModule] = useState('');
  const [saving, setSaving] = useState(false);

  const modes = [
    { id: 'Builder', icon: Cpu, desc: 'Optimized for system creation and growth architecture.' },
    { id: 'Money', icon: Target, desc: 'Aggressive focus on revenue-generating mandates.' },
    { id: 'Monk', icon: Shield, desc: 'Deep work mode with distraction suppression.' },
    { id: 'War', icon: Zap, desc: 'High-intensity deployment for critical deadlines.' }
  ];

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        mode: mode,
        custom_modules: modules
      })
      .eq('id', userId);

    if (!error) {
      onUpdate();
      alert('System Settings Synchronized.');
    }
    setSaving(false);
  };

  const addModule = () => {
    if (newModule.trim() && !modules.includes(newModule.trim())) {
      setModules([...modules, newModule.trim()]);
      setNewModule('');
    }
  };

  const removeModule = (m: string) => {
    setModules(modules.filter(mod => mod !== m));
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-4xl">
      <div className="px-2">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">SYSTEM SETTINGS</h2>
        <p className="text-[11px] font-medium text-slate-500 mt-2 uppercase tracking-widest">Global application configuration and operational modes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* OPERATIONAL MODE */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="text-cyan-400 w-5 h-5" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">OPERATIONAL MODE</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center p-4 rounded-xl border transition-all text-left group ${
                  mode === m.id 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-white' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors ${
                  mode === m.id ? 'bg-cyan-400 text-black' : 'bg-white/5 text-slate-500 group-hover:text-white'
                }`}>
                  <m.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1">{m.id} MODE</p>
                  <p className="text-[9px] text-slate-500 leading-tight">{m.desc}</p>
                </div>
                {mode === m.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* CUSTOM MODULES */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-2">
            <Cpu className="text-purple-400 w-5 h-5" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">MISSION CATEGORIES</h3>
          </div>

          <div className="flex flex-wrap gap-2 flex-1 content-start">
            {modules.map((m) => (
              <div key={m} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center space-x-2 group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m}</span>
                <button onClick={() => removeModule(m)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex space-x-2">
            <input 
              type="text" 
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
              placeholder="Deploy new category..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-purple-500/50"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())}
            />
            <button 
              onClick={(e) => { e.preventDefault(); addModule(); }}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <Zap size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* SYSTEM ACTIONS */}
      <section className="glass-panel p-8 rounded-2xl border border-white/5 flex justify-between items-center bg-gradient-to-r from-cyan-500/5 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400 flex items-center justify-center">
            <Save size={24} className="text-black" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">SYNCHRONIZE SYSTEM</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Upload configuration to global mothership.</p>
          </div>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="px-10 py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] active:scale-95"
        >
          {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
        </button>
      </section>
    </div>
  );
}
