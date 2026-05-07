'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Task, Priority, MissionType } from '../lib/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  editingTask?: Task | null;
  modules: string[];
}

export default function TaskModal({ isOpen, onClose, onSave, editingTask, modules }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [type, setType] = useState<MissionType>('daily');
  const [module, setModule] = useState(modules?.[0] || 'General');
  const [dueDate, setDueDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [xp, setXp] = useState(150);
  const [taskMode, setTaskMode] = useState('Builder');
  const [taskRole, setTaskRole] = useState('user');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setType(editingTask.type || 'daily');
      setModule(editingTask.module || modules?.[0] || 'General');
      setDueDate(editingTask.due_date?.split('T')[0] || '');
      setImageUrl(editingTask.image_url || '');
      setLink(editingTask.link || '');
      setXp(editingTask.xp || 150);
      setTaskMode(editingTask.mode || 'Builder');
      setTaskRole(editingTask.assigned_role || 'user');
    } else {
      resetForm();
    }
  }, [editingTask, isOpen, modules]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setType('daily');
    setModule(modules?.[0] || 'General');
    setDueDate('');
    setImageUrl('');
    setLink('');
    setXp(150);
    setTaskMode('Builder');
    setTaskRole('user');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tasks/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('task-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('task-images').getPublicUrl(filePath);
      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Tactical Upload Failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      priority,
      type,
      module,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      image_url: imageUrl,
      link,
      xp: Number(xp),
      mode: taskMode,
      assigned_role: taskRole,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="relative w-full max-w-3xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto"
          >
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#00f2ff]/5 to-transparent flex justify-between items-center">
              <div><h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">{editingTask ? 'UPDATE MISSION' : 'SYNCHRONIZE MISSION'}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tactical Operational Deployment</p></div>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">MISSION TITLE</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#00f2ff]/50 outline-none transition-all" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">TYPE</label>
                  <select value={type} onChange={(e) => setType(e.target.value as MissionType)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white text-[10px] uppercase outline-none">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="boss">Boss</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">PRIORITY</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white text-[10px] uppercase outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">BOUNTY (XP)</label>
                  <input type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white text-[10px] outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">DEADLINE</label>
                   <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white text-[10px] outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">MISSION INTEL (NOTES)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[#00f2ff]/50 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">MISSION BRIEFING IMAGE</label>
                <div className="flex items-center space-x-4">
                  <div 
                    onClick={() => document.getElementById('task-image-upload')?.click()}
                    className={`flex-1 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${imageUrl ? 'border-[#00f2ff]/50 bg-[#00f2ff]/5' : 'border-white/10 bg-white/5 hover:border-[#00f2ff]/30'}`}
                  >
                    {uploading ? (
                      <span className="text-[8px] font-bold text-[#00f2ff] animate-pulse">UPLOADING...</span>
                    ) : imageUrl ? (
                      <div className="flex items-center space-x-3 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10"><img src={imageUrl} className="w-full h-full object-cover" alt="Preview" /></div>
                        <span className="text-[8px] font-bold text-green-500 uppercase">IMAGE SECURED</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={16} className="text-slate-600 mb-1" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Click to upload briefing image</span>
                      </div>
                    )}
                    <input id="task-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                  {imageUrl && (
                    <button type="button" onClick={() => setImageUrl('')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"><X size={16} /></button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#00f2ff] tracking-[0.2em] uppercase">SECTOR (MODULE)</label>
                  <div className="flex flex-wrap gap-2">
                    {modules.map(m => (
                      <button type="button" key={m} onClick={() => setModule(m)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${module === m ? 'bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]' : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#7000ff] tracking-[0.2em] uppercase">IDENTITY MODE</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Builder', 'Money', 'Monk', 'War'].map(m => (
                      <button type="button" key={m} onClick={() => setTaskMode(m)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${taskMode === m ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(112,0,255,0.3)]' : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-emerald-500 tracking-[0.2em] uppercase">IDENTITY ROLE</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'user', label: 'Operator' },
                      { id: 'parent', label: 'Guardian' }
                    ].map(r => (
                      <button type="button" key={r.id} onClick={() => setTaskRole(r.id)} className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${taskRole === r.id ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold text-xs tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] flex items-center justify-center space-x-3">
                <Save size={18} /><span>{editingTask ? 'UPDATE CORE' : 'SYNCHRONIZE MISSION'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
