import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Zap } from 'lucide-react';
import type { Task, Priority } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  editingTask?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSave, editingTask }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Tactical');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setDueDate(editingTask.dueDate?.split('T')[0] || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Tactical');
      setDueDate('');
    }
  }, [editingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-lg glass-panel p-8 rounded-3xl border-cyan-500/20 overflow-hidden"
          >
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] -z-10" />
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                  <Zap size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {editingTask ? 'EDIT_MISSION' : 'INITIALIZE_MISSION'}
                  </h3>
                  <p className="text-[10px] font-mono font-bold text-cyan-400/60 tracking-widest uppercase mt-1">
                    Neural Link Active v4.2
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">MISSION TITLE</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="DESIGNATE OBJECTIVE..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">TACTICAL DETAILS</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ADD OPERATIONAL PARAMETERS..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">PRIORITY_LEVEL</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-xs uppercase appearance-none cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Routine Ops</option>
                    <option value="high">Critical Asset</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">TARGET_DATE</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-xs cursor-pointer"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:shadow-[0_0_40px_rgba(0,242,255,0.5)] active:scale-[0.98] flex items-center justify-center space-x-3"
              >
                <Save size={18} />
                <span>{editingTask ? 'UPDATE_MISSION' : 'INITIALIZE_CORE'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
