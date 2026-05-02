'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInsights, Insight } from '../lib/ai/insightService';

export default function AIInsights({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    setLoading(true);
    const data = await generateInsights(userId);
    setInsights(data);
    setLoading(false);
  };

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  if (loading) return null;
  if (insights.length === 0) return null;

  const current = insights[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl border-[#00f2ff]/20 bg-[#00f2ff]/5 relative overflow-hidden group shadow-[0_0_50px_rgba(0,242,255,0.05)]"
    >
      <div className="absolute top-0 right-0 p-4">
        <Sparkles size={16} className="text-[#00f2ff] animate-pulse" />
      </div>

      <div className="flex items-start space-x-5">
        <div className={`p-3 rounded-xl ${
          current.type === 'warning' ? 'bg-red-500/20 text-red-500' : 
          current.type === 'opportunity' ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 
          'bg-purple-500/20 text-purple-500'
        }`}>
          {current.type === 'warning' && <AlertTriangle size={24} />}
          {current.type === 'opportunity' && <Zap size={24} />}
          {current.type === 'performance' && <TrendingUp size={24} />}
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
            Coach's Insight • {current.type}
          </p>
          <p className="text-sm font-bold text-white leading-relaxed">
            "{current.text}"
          </p>
        </div>

        <button 
          onClick={nextInsight}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / insights.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff]"
        />
      </div>
    </motion.div>
  );
}
