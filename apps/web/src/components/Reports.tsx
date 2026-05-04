'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { Target, Zap, BarChart3, PieChart as PieIcon } from 'lucide-react';
import type { Task } from '../lib/types';

interface ReportsProps {
  tasks: Task[];
}

export default function Reports({ tasks }: ReportsProps) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // XP by Module
  const moduleData = tasks.reduce((acc: any, task) => {
    const module = task.module || 'General';
    if (!acc[module]) acc[module] = { name: module, xp: 0, count: 0 };
    if (task.status === 'completed') acc[module].xp += task.xp || 150;
    acc[module].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(moduleData);
  const COLORS = ['#00f2ff', '#7000ff', '#ffb800', '#00ff88', '#ff3b30'];

  return (
    <div className="space-y-8 pb-20">
      <div className="px-2">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">INTEL REPORT</h2>
        <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Sector Performance Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* XP Distribution */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 rounded-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <Zap size={20} className="text-[#00f2ff]" />
            <h3 className="text-xs font-bold uppercase tracking-widest">XP BY MODULE</h3>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#00f2ff', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#00f2ff]/20 border-t-[#00f2ff] rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Mission Status */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 rounded-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <PieIcon size={20} className="text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest">MISSION LOAD</h3>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
                      { name: 'Active', value: tasks.filter(t => t.status === 'in-progress').length },
                      { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length },
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#00ff88" />
                    <Cell fill="#ffb800" />
                    <Cell fill="#333" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#00f2ff]/20 border-t-[#00f2ff] rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'EFFICIENCY', value: `${Math.round((completedTasks.length / (tasks.length || 1)) * 100)}%`, icon: Target, color: 'text-[#00f2ff]' },
          { label: 'AVG BOUNTY', value: `${Math.round(completedTasks.reduce((a, b) => a + (b.xp || 150), 0) / (completedTasks.length || 1))} XP`, icon: Zap, color: 'text-purple-500' },
          { label: 'THROUGHPUT', value: completedTasks.length, icon: BarChart3, color: 'text-green-500' }
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl flex items-center space-x-6">
            <div className={`p-4 rounded-lg bg-white/5 ${stat.color}`}><stat.icon size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
