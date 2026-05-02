'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Terminal, Zap, BarChart3, Target, Activity } from 'lucide-react';
import { detectOperativeState, OperativeState } from '../lib/ai/stateDetection';
import { generateCoachingResponse, generateIntelligentResponse, AIIntent } from '../lib/ai/responseEngine';
import { supabase } from '../lib/supabase';
import { calculateLevel } from '../lib/gameLogic';

export default function AICoach({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<OperativeState>('neutral');
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: any }[]>([
    { role: 'ai', text: "Hi there! I'm your productivity coach. I've been looking over your progress—how can I help you stay on track today?" }
  ]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateState();
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      setChat(prev => {
        if (prev.length === 1 && prev[0].role === 'ai') {
          const name = data.full_name?.split(' ')[0] || 'Arpan';
          return [{
            role: 'ai',
            text: `Hi ${name}! I'm your productivity coach. I've been looking over your progress—how can I help you stay on track today?`
          }];
        }
        return prev;
      });
    }
  };

  const updateState = async (text?: string) => {
    const result = await detectOperativeState(userId, text);
    setState(result.state);
    return result.state;
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    setLoading(true);
    setChat(prev => [...prev, { role: 'user', text: command }]);
    setMessage('');
    
    // 1. Detect Intent from keywords
    let intent: AIIntent = 'general';
    const lower = command.toLowerCase();
    if (lower.includes('plan')) intent = 'plan';
    else if (lower.includes('strategy') || lower.includes('how to')) intent = 'strategy';
    else if (lower.includes('low') || lower.includes('sad') || lower.includes('tired') || lower.includes('motivate')) intent = 'motivation';
    else if (lower.includes('teach') || lower.includes('knowledge') || lower.includes('concept')) intent = 'knowledge';

    // 2. Detect state
    const currentState = await updateState(command);

    // 3. Fetch data for response
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const { data: pendingTasks } = await supabase.from('tasks').select('*').eq('user_id', userId).eq('status', 'todo');

    // 4. Generate response
    const coaching = await generateIntelligentResponse(intent, currentState, {
      xp: profile?.xp || 0,
      streak: profile?.streak || 0,
      pendingTasks: pendingTasks || [],
      level: calculateLevel(profile?.xp || 0),
      mode: profile?.mode || 'Builder',
      name: profile?.full_name?.split(' ')[0] || 'Arpan'
    });
    
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'ai', 
        text: (
          <div className="space-y-3">
            <p className="font-black text-[#00f2ff]">{coaching.tone}</p>
            <p><span className="text-slate-500 mr-2 uppercase text-[9px] tracking-widest">My Take:</span>{coaching.insight}</p>
            <p><span className="text-slate-500 mr-2 uppercase text-[9px] tracking-widest">Suggestion:</span>{coaching.action}</p>
            <p className="text-[10px] text-red-400 italic"><span className="text-slate-500 mr-2 uppercase text-[9px] tracking-widest italic">Note:</span>{coaching.urgency}</p>
          </div>
        ) 
      }]);
      setLoading(false);
    }, 800);
  };


  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#00f2ff] to-[#7000ff] flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)] z-[100]"
      >
        <Bot size={32} className="text-black" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-32 right-8 w-96 h-[500px] glass-panel-active rounded-3xl z-[101] flex flex-col shadow-2xl border border-[#00f2ff]/30 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-[#00f2ff]/20 flex items-center justify-center relative">
                  <Terminal size={18} className="text-[#00f2ff]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-black animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Coach • <span className="text-[#00f2ff]">{state === 'peak' ? 'IN THE FLOW' : state.toUpperCase()}</span></h3>
                  <p className="text-[8px] font-mono text-slate-500">STATUS: {state === 'peak' ? 'MAX MOMENTUM' : 'ACTIVE'}</p>
                </div>

              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-[11px]">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-white/10 text-white rounded-tr-none' 
                      : 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#00f2ff]/5 p-4 rounded-2xl animate-pulse text-slate-500">
                    Checking your progress...
                  </div>
                </div>
              )}
            </div>

            {/* Commands */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3 border-t border-white/10">
              <button 
                onClick={() => handleCommand('Plan my day')}
                className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 hover:bg-[#00f2ff]/5 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <Zap size={14} className="text-[#00f2ff]" />
                <span>Plan Day</span>
              </button>
              <button 
                onClick={() => handleCommand('Get strategy')}
                className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <Target size={14} className="text-purple-500" />
                <span>Strategy</span>
              </button>
              <button 
                onClick={() => handleCommand('I feel low')}
                className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <Activity size={14} className="text-red-500" />
                <span>Motivation</span>
              </button>
              <button 
                onClick={() => handleCommand('Teach me')}
                className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <BarChart3 size={14} className="text-emerald-500" />
                <span>Knowledge</span>
              </button>
            </div>

            {/* Input */}
            <div className="p-6 pt-0">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="How can I help you today?"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-slate-700 outline-none focus:border-[#00f2ff]/50 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommand(message)}
                />
                <button 
                  onClick={() => handleCommand(message)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00f2ff] transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
