'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Terminal, Zap, BarChart3, Target } from 'lucide-react';

export default function AICoach({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Operational Coach online. Tactical data analyzed. What is your objective?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleCommand = async (command: string) => {
    setLoading(true);
    setChat(prev => [...prev, { role: 'user', text: command }]);
    
    // Simulate AI processing (Wiring for real API later)
    setTimeout(() => {
      let response = "";
      if (command.includes('Plan')) {
        response = "PLANNING_SEQUENCE: Based on your peak focus time (10:00), I suggest tackling your 'Money Mode' task first. Your completion rate is 20% higher when you start with high-priority mandates.";
      } else if (command.includes('Analyze')) {
        response = "BRUTAL_TRUTH: Your streak is healthy, but you are avoiding high-value tasks. You spent 4 hours on low-XP maintenance yesterday. This is busy-ness, not productivity.";
      } else {
        response = "MANDATE_RECEIVED: Analyzing neural patterns. Continue your current streak to unlock further insights.";
      }
      
      setChat(prev => [...prev, { role: 'ai', text: response }]);
      setLoading(false);
    }, 1000);
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
                <div className="w-8 h-8 rounded bg-[#00f2ff]/20 flex items-center justify-center">
                  <Terminal size={18} className="text-[#00f2ff]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Mission Coach</h3>
                  <p className="text-[8px] font-mono text-[#00f2ff] animate-pulse">V2.4 NEURAL_LINK_STABLE</p>
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
                    DECRYPTING_NEURAL_SIGNALS...
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
                onClick={() => handleCommand('Analyze me')}
                className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <BarChart3 size={14} className="text-purple-500" />
                <span>Analyze</span>
              </button>
            </div>

            {/* Input */}
            <div className="p-6 pt-0">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="TRANSMIT COMMAND..."
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
