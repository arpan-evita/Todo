'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function VerifiedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00f2ff]/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 glass-panel max-w-md w-full p-12 rounded-3xl border-[#00f2ff]/20 text-center shadow-[0_0_50px_rgba(0,242,255,0.1)]"
      >
        <div className="w-20 h-20 bg-[#00f2ff]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[#00f2ff]/30 shadow-[0_0_30px_rgba(0,242,255,0.2)]">
          <ShieldCheck className="text-[#00f2ff]" size={40} />
        </div>

        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none text-white">MISSION AUTHORIZED</h1>
        <p className="text-[11px] font-mono font-bold text-[#00f2ff] uppercase tracking-[0.2em] mb-8">Identity Verified • Neural Link Active</p>
        
        <div className="space-y-6">
          <p className="text-sm text-slate-400 leading-relaxed">
            Your credentials have been authenticated. You now have full clearance to access the Mission Control dashboard.
          </p>

          <div className="flex items-center justify-center space-x-3 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
            <Loader2 className="animate-spin" size={14} />
            <span>Redirecting to Terminal in {countdown}s</span>
          </div>

          <button 
            onClick={() => router.push('/')}
            className="w-full py-4 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-black font-black text-xs tracking-[0.2em] uppercase rounded-xl transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,255,0.2)] flex items-center justify-center space-x-2"
          >
            <span>Enter Terminal</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>

      {/* Decorative Monospace Accents */}
      <div className="fixed bottom-10 left-10 text-[8px] font-mono text-slate-800 uppercase tracking-[0.5em] rotate-90 origin-left">
        System_Status: Verified
      </div>
      <div className="fixed top-10 right-10 text-[8px] font-mono text-slate-800 uppercase tracking-[0.5em] -rotate-90 origin-right">
        Auth_Protocol: 77-Alpha
      </div>
    </div>
  );
}
