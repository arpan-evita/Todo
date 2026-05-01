import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import type { Task, Priority } from '../types';

import { supabase } from '../supabaseClient';

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
  const [module, setModule] = useState(modules[0] || 'General');
  const [dueDate, setDueDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [xp, setXp] = useState(150);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setModule(editingTask.module || modules[0] || 'General');
      setDueDate(editingTask.due_date?.split('T')[0] || '');
      setImageUrl(editingTask.image_url || '');
      setLink(editingTask.link || '');
      setXp(editingTask.xp || 150);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setModule(modules[0] || 'General');
      setDueDate('');
      setImageUrl('');
      setLink('');
      setXp(150);
    }
  }, [editingTask, isOpen, modules]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tasks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Tactical Upload Failed: Ensure "task-images" bucket exists and is public.');
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
      module,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      image_url: imageUrl,
      link,
      xp: Number(xp),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 overflow-y-auto">
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#00f2ff]/5 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
                    {editingTask ? 'UPDATE TASK' : 'SYNCHRONIZE TASK'}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400">
                    Deploy a new operational mandate to the agency network.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">TASK TITLE</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Optimize H1 Structures"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f2ff]/50 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">REFERENCE LINK (URL)</label>
                <input 
                  type="url" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/brief"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f2ff]/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">MODULE</label>
                  <select 
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all text-[10px] appearance-none cursor-pointer"
                  >
                    {modules.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">PRIORITY</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all text-[10px] appearance-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">MISSION_BOUNTY (XP)</label>
                  <input 
                    type="number" 
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all text-[10px] cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">DUE DATE</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all text-[10px] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">DESCRIPTION</label>
                  <span className="text-[9px] text-slate-600">Supports Paste (Ctrl+V) for Images</span>
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide operational details..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f2ff]/50 transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">ATTACHED SCREENSHOTS</label>
                  <label className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${uploading ? 'bg-slate-800 text-slate-500' : 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 hover:bg-[#00f2ff]/20'}`}>
                    <Upload size={12} />
                    <span>{uploading ? 'UPLOADING...' : 'UPLOAD'}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                  </label>
                </div>
                
                <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all relative overflow-hidden group">
                  {imageUrl ? (
                    <div className="w-full h-48 relative">
                      <img src={imageUrl} className="w-full h-full object-cover rounded-lg opacity-60" alt="Tactical Preview" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-[10px] font-bold text-white uppercase tracking-widest">Image Attached</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-slate-700 mb-3" />
                      <p className="text-slate-600 text-[10px] font-medium">No screenshots attached yet.</p>
                    </>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold text-xs tracking-[0.1em] uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] active:scale-[0.98] flex items-center justify-center space-x-3"
              >
                <Save size={18} />
                <span>{editingTask ? 'UPDATE CORE' : 'SYNCHRONIZE TASK'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
