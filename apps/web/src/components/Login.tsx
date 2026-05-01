'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Cpu, Mail, Chrome, Bolt, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) alert(error.message);
    else alert('Mission intel sent to your inbox. Check for the access code.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 relative overflow-hidden">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00f2ff]/10 blur-[150px] rounded-full -z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#7000ff]/10 blur-[150px] rounded-full -z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-10 rounded-3xl relative z-10 border border-white/10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f2ff] to-[#7000ff] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,255,0.3)]">
            <Cpu size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-center">
            AUTOGROWX:<br />MISSION CONTROL
          </h1>
          <p className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-[0.3em] mt-4">Initialize Neural Link</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full h-14 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center space-x-3 hover:bg-slate-200 transition-all active:scale-95"
          >
            <Chrome size={20} />
            <span>Sync with Google Intelligence</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500 bg-[#050508] px-4">OR SECURE TERMINAL</div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="OPERATIVE EMAIL..." 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs font-mono font-bold tracking-widest outline-none focus:border-[#00f2ff]/50 transition-all placeholder:text-slate-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-black font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center space-x-3 hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Deploy OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-40">
           <div className="flex items-center space-x-2"><Bolt size={14} /><span className="text-[8px] font-mono font-bold uppercase tracking-widest">End-to-End Encrypted</span></div>
           <span className="text-[8px] font-mono font-bold uppercase tracking-widest">v2.0.4-STABLE</span>
        </div>
      </motion.div>
    </div>
  );
}
