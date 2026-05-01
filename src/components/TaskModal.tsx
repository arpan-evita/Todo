import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
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
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');

  // Sync state when editingTask changes
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
      setCategory('Work');
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
        <>
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="modal-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingTask ? 'Edit Task' : 'New Mission'}</h3>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted uppercase">Task Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '15px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted uppercase">Details</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '15px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase">Category</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted uppercase">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                />
              </div>

              <button 
                type="submit"
                style={{ background: '#00f2ff', border: 'none', padding: '16px', borderRadius: '18px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', boxShadow: '0 0 20px rgba(0, 242, 255, 0.4)' }}
              >
                <Save size={20} />
                {editingTask ? 'Save Changes' : 'Initialize Task'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
